# Function to convert CRLF to LF
function Convert-ToUnixEOL {
    param (
        [string]$path
    )
    $content = Get-Content -Raw -Path $path
    $content = $content -replace "`r`n", "`n"
    Set-Content -Path $path -Value $content -NoNewline
}

# Get all the files recursively and convert line endings
Get-ChildItem -Path . -Recurse -File | ForEach-Object {
    Convert-ToUnixEOL -path $_.FullName
}
