<# Khởi động PostgreSQL bằng Docker Compose và đợi tới khi healthy. #>
. "$PSScriptRoot\common.ps1"
Set-Location $RepoRoot

if (-not (Test-Path -LiteralPath (Join-Path $RepoRoot '.env'))) { throw 'Chưa có .env. Hãy chạy .\scripts\setup.ps1 trước.' }

Write-Step 'Khởi động PostgreSQL'
docker compose up -d postgres
if ($LASTEXITCODE -ne 0) { throw 'docker compose up thất bại. Docker Desktop đã chạy chưa?' }

Write-Step 'Đợi PostgreSQL sẵn sàng (tối đa 90 giây)'
$deadline = (Get-Date).AddSeconds(90)
do {
    $status = (Get-ToolOutput 'docker' @('inspect', '--format', '{{.State.Health.Status}}', 'nexus-postgres')).Trim()
    if ($status -eq 'healthy') { Write-Ok 'PostgreSQL đang healthy.'; return }
    Start-Sleep -Seconds 3
} while ((Get-Date) -lt $deadline)

Write-Fail "PostgreSQL chưa healthy (trạng thái: $status). Xem log: docker compose logs postgres"
exit 1
