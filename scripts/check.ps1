<# Kiểm tra nhanh hệ thống đang chạy: database, Flyway, backend, bảo mật cơ bản, frontend. #>
. "$PSScriptRoot\common.ps1"
Set-Location $RepoRoot

function Get-StatusCode([string]$Url) {
    try { return (Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 8).StatusCode }
    catch {
        if ($_.Exception.Response) { return [int]$_.Exception.Response.StatusCode }
        return $null
    }
}

Write-Step 'Docker / PostgreSQL'
docker compose ps

Write-Step 'Lịch sử Flyway migration'
docker compose exec -T postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "select version, description, success from flyway_schema_history order by installed_rank;"'

Write-Step 'Backend: /api/v1/system/health'
try {
    $health = Invoke-RestMethod -Uri 'http://localhost:8080/api/v1/system/health' -TimeoutSec 8
    Write-Ok "status=$($health.status) database=$($health.database)"
} catch { Write-Fail 'Không gọi được backend (đã chạy start-backend.ps1 chưa?).' }

Write-Step 'Backend: /actuator/health'
$code = Get-StatusCode 'http://localhost:8080/actuator/health'
if ($code -eq 200) { Write-Ok 'actuator/health = 200' } else { Write-Fail "actuator/health = $code" }

Write-Step 'Bảo mật: gọi API thiết bị khi CHƯA đăng nhập phải trả 401'
$code = Get-StatusCode 'http://localhost:8080/api/v1/devices'
if ($code -eq 401) { Write-Ok '/api/v1/devices = 401 (đúng như mong đợi)' } else { Write-Fail "/api/v1/devices = $code (mong đợi 401)" }

Write-Step 'Frontend: http://localhost:5173'
$code = Get-StatusCode 'http://localhost:5173'
if ($code -eq 200) { Write-Ok 'frontend = 200' } else { Write-Fail "frontend = $code (đã chạy start-frontend.ps1 chưa?)" }
