# Hàm dùng chung cho các script. Được "dot-source" từ script khác: . "$PSScriptRoot\common.ps1"
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$script:RepoRoot = Split-Path -Parent $PSScriptRoot

function Write-Step([string]$Message) { Write-Host "==> $Message" -ForegroundColor Cyan }
function Write-Ok([string]$Message)   { Write-Host "[OK]   $Message" -ForegroundColor Green }
function Write-Fail([string]$Message) { Write-Host "[LOI]  $Message" -ForegroundColor Red }

# Chạy lệnh ngoài và lấy toàn bộ output (kể cả stderr, ví dụ `java -version`) mà không bị PowerShell 5.1 coi là lỗi.
function Get-ToolOutput {
    param([string]$Command, [string[]]$Arguments)
    if (-not (Get-Command $Command -ErrorAction SilentlyContinue)) { return $null }
    $previous = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    try {
        $lines = & $Command @Arguments 2>&1 | ForEach-Object { $_.ToString() }
        return ($lines -join "`n")
    } finally {
        $ErrorActionPreference = $previous
    }
}

# Đọc file .env (KEY=VALUE) và nạp vào biến môi trường của tiến trình hiện tại.
function Import-DotEnv {
    param([string]$Path = (Join-Path $script:RepoRoot '.env'))
    if (-not (Test-Path -LiteralPath $Path)) {
        throw "Chưa có file .env. Hãy chạy: .\scripts\setup.ps1"
    }
    foreach ($raw in Get-Content -LiteralPath $Path -Encoding UTF8) {
        $line = $raw.Trim()
        if ($line -eq '' -or $line.StartsWith('#')) { continue }
        $idx = $line.IndexOf('=')
        if ($idx -lt 1) { continue }
        $key = $line.Substring(0, $idx).Trim()
        $value = $line.Substring($idx + 1).Trim()
        if ($value.Length -ge 2 -and (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'")))) {
            $value = $value.Substring(1, $value.Length - 2)
        }
        [Environment]::SetEnvironmentVariable($key, $value, 'Process')
    }
}

function New-RandomPassword {
    param([int]$Length = 24)
    $alphabet = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    $bytes = New-Object byte[] $Length
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    try { $rng.GetBytes($bytes) } finally { $rng.Dispose() }
    $chars = for ($i = 0; $i -lt $Length; $i++) { $alphabet[$bytes[$i] % $alphabet.Length] }
    return -join $chars
}

# Trả về đường dẫn lệnh mvn: ưu tiên Maven có sẵn, nếu không thì tải Maven vào .tools/ (có kiểm tra SHA-512).
function Get-MavenCommand {
    $existing = Get-Command mvn -ErrorAction SilentlyContinue
    if ($existing) { return $existing.Source }

    $version = '3.9.9'
    $toolsDir = Join-Path $script:RepoRoot '.tools'
    $mavenHome = Join-Path $toolsDir "apache-maven-$version"
    $mvnCmd = Join-Path $mavenHome 'bin\mvn.cmd'
    if (Test-Path -LiteralPath $mvnCmd) { return $mvnCmd }

    Write-Step "Không thấy Maven. Đang tải Apache Maven $version vào .tools\ (một lần duy nhất)..."
    New-Item -ItemType Directory -Force -Path $toolsDir | Out-Null
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    $base = "https://archive.apache.org/dist/maven/maven-3/$version/binaries"
    $zip = Join-Path $toolsDir "apache-maven-$version-bin.zip"
    Invoke-WebRequest -Uri "$base/apache-maven-$version-bin.zip" -OutFile $zip -UseBasicParsing

    $response = Invoke-WebRequest -Uri "$base/apache-maven-$version-bin.zip.sha512" -UseBasicParsing
    $content = $response.Content
    if ($content -is [byte[]]) { $content = [System.Text.Encoding]::ASCII.GetString($content) }
    $expected = ($content.Trim() -split '\s+')[0].ToLowerInvariant()
    $actual = (Get-FileHash -Algorithm SHA512 -LiteralPath $zip).Hash.ToLowerInvariant()
    if ($expected -ne $actual) {
        Remove-Item -LiteralPath $zip -Force
        throw "Checksum SHA-512 của Maven không khớp. Đã xóa file tải về. Hãy thử lại hoặc cài Maven thủ công."
    }
    Expand-Archive -LiteralPath $zip -DestinationPath $toolsDir -Force
    Remove-Item -LiteralPath $zip -Force
    if (-not (Test-Path -LiteralPath $mvnCmd)) { throw "Giải nén Maven xong nhưng không thấy $mvnCmd" }
    return $mvnCmd
}
