@echo off
setlocal
set "URI=http://localhost:8080/api/observaciones"
set "BODY={\"titulo\":\"Prueba de endpoint\",\"descripcion\":\"Observación enviada desde CMD para validar persistencia\",\"sistemaNombre\":\"Sistema de prueba\"}"

powershell -NoProfile -Command "$headers = @{ 'Content-Type' = 'application/json' }; Invoke-RestMethod -Method Post -Uri '%URI%' -Headers $headers -Body '%BODY%' | ConvertTo-Json -Depth 10"

echo.
echo Verificando registro en PostgreSQL...
docker compose -f ..\docker-compose.yml exec -T postgres psql -U postgres -d diagti_db -c "SELECT id, titulo, descripcion, sistema_nombre, fecha_registro FROM observaciones ORDER BY id DESC LIMIT 5;"
