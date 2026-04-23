# Loads and exports environment variables from .env file
envFilePath = Join-Path -Path $PSScriptRoot -ChildPath ".env"
if (Test-Path -Path $envFilePath) {
    Get-Content -Path $envFilePath | ForEach-Object {
        if ($_ -match "^\s*([^#][^=]+?)\s*=\s*(.+)\s*$") {
            $name = $matches[1]
            $value = $matches[2]
            [System.Environment]::SetEnvironmentVariable($name, $value, [System.EnvironmentVariableTarget]::Process)
        }
    }
}