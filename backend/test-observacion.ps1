$uri = 'http://localhost:8080/api/observaciones'
$payload = @{
  titulo = 'Prueba de endpoint'
  descripcion = 'Observación enviada desde PowerShell para validar persistencia'
  sistemaNombre = 'Sistema de prueba'
} | ConvertTo-Json -Depth 5

$client = [System.Net.Http.HttpClient]::new()
$body = [System.Net.Http.StringContent]::new($payload, [System.Text.UTF8Encoding]::new($false), 'application/json')
$response = $client.PostAsync($uri, $body).GetAwaiter().GetResult()
$content = $response.Content.ReadAsStringAsync().GetAwaiter().GetResult()

Write-Host "Status: $($response.StatusCode)"
Write-Host $content

Write-Host ''
Write-Host 'Verificando registro en PostgreSQL...'
docker compose -f '..\docker-compose.yml' exec -T postgres psql -U postgres -d diagti_db -c "SELECT id, titulo, descripcion, sistema_nombre, fecha_registro FROM observaciones ORDER BY id DESC LIMIT 5;"
