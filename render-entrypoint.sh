#!/usr/bin/env bash
set -Eeuo pipefail

PORT="${PORT:-10000}"
BACKEND_PORT="${BACKEND_PORT:-8080}"
APP_UPLOADS_PATH="${APP_UPLOADS_PATH:-/tmp/diagti-uploads/evidencias}"

log() {
    printf '[DIAGTI-RENDER] %s\n' "$*"
}

require_env() {
    local name="$1"
    if [[ -z "${!name:-}" ]]; then
        log "Falta la variable obligatoria: ${name}"
        exit 1
    fi
}

# Render proporciona una connectionString de PostgreSQL. Se obtiene de ella
# el host y el puerto; usuario, contraseña y base llegan como variables separadas.
if [[ -n "${DATABASE_URL:-}" ]]; then
    DB_AUTHORITY="${DATABASE_URL#*://}"
    DB_AUTHORITY="${DB_AUTHORITY%%/*}"
    DB_HOSTPORT="${DB_AUTHORITY##*@}"
    export DB_HOST="${DB_HOSTPORT%%:*}"
    export DB_PORT="${DB_HOSTPORT##*:}"
fi

require_env DB_HOST
require_env DB_PORT
require_env DB_NAME
require_env DB_USER
require_env DB_PASSWORD

export PGPASSWORD="$DB_PASSWORD"

log "Esperando conexión con PostgreSQL..."
for attempt in $(seq 1 90); do
    if pg_isready \
        --host="$DB_HOST" \
        --port="$DB_PORT" \
        --username="$DB_USER" \
        --dbname="$DB_NAME" >/dev/null 2>&1; then
        log "PostgreSQL disponible."
        break
    fi

    if [[ "$attempt" -eq 90 ]]; then
        log "PostgreSQL no respondió después de 90 intentos."
        exit 1
    fi

    sleep 2
done

DB_ARGS=(
    --host="$DB_HOST"
    --port="$DB_PORT"
    --username="$DB_USER"
    --dbname="$DB_NAME"
)

INIT_MARKER="$({ psql "${DB_ARGS[@]}" --tuples-only --no-align \
    --command="SELECT to_regclass('public.diagti_render_init');"; } 2>/dev/null | tr -d '[:space:]')"

if [[ "$INIT_MARKER" != "diagti_render_init" ]]; then
    log "Base nueva detectada. Creando tablas y datos iniciales..."

    # La transacción evita dejar una base incompleta si algún script falla.
    psql "${DB_ARGS[@]}" \
        --set=ON_ERROR_STOP=1 \
        --single-transaction \
        --file=/docker-entrypoint-initdb.d/init.sql

    psql "${DB_ARGS[@]}" \
        --set=ON_ERROR_STOP=1 \
        --command="
            CREATE TABLE IF NOT EXISTS diagti_render_init (
                id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
                inicializado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            INSERT INTO diagti_render_init (id)
            VALUES (1)
            ON CONFLICT (id) DO NOTHING;
        "

    log "Inicialización de PostgreSQL completada."
else
    log "La base ya estaba inicializada; no se repetirán los datos de prueba."
fi

mkdir -p "$APP_UPLOADS_PATH"

# Solo se sustituye PORT para no borrar variables propias de Nginx como $uri.
envsubst '${PORT}' \
    < /etc/nginx/templates/diagti.conf.template \
    > /etc/nginx/conf.d/default.conf

nginx -t

log "Iniciando Spring Boot en el puerto ${BACKEND_PORT}..."
java -jar /app/diagti.jar &
JAVA_PID=$!

log "Iniciando Nginx en el puerto público ${PORT}..."
nginx -g 'daemon off;' &
NGINX_PID=$!

shutdown() {
    log "Deteniendo servicios..."
    kill -TERM "$JAVA_PID" "$NGINX_PID" 2>/dev/null || true
}

trap shutdown SIGTERM SIGINT

set +e
wait -n "$JAVA_PID" "$NGINX_PID"
STATUS=$?
set -e

shutdown
wait "$JAVA_PID" 2>/dev/null || true
wait "$NGINX_PID" 2>/dev/null || true
exit "$STATUS"
