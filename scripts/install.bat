@echo off
setlocal enabledelayedexpansion

echo Checking for native dependencies...

:: Check for .NET 10 SDK
set "SDK_MISSING=1"
dotnet --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=1 delims=." %%a in ('dotnet --version') do set DOTNET_MAJOR=%%a
    if "!DOTNET_MAJOR!"=="10" (
        set "SDK_MISSING="
    ) else (
        echo .NET SDK version !DOTNET_MAJOR! found, but .NET 10 is required.
    )
)

:: Check for Node.js
set "NODE_MISSING=1"
node -v >nul 2>&1
if %errorlevel% equ 0 (
    set "NODE_MISSING="
)

if not defined SDK_MISSING if not defined NODE_MISSING (
    echo .NET 10 and Node.js are already installed. Skipping WSL 2 check...
    goto :eof
)

echo Checking for WSL 2...
wsl --status >nul 2>&1
if %errorlevel% equ 0 (
    echo WSL 2 is installed on this system, switching to WSL to use Devbox...
    wsl bash ./scripts/install.sh
    goto :eof
)

echo WSL 2 not found, native Windows setup is offered as a fallback.
echo Checking for winget...
winget --version >nul 2>&1
if %errorlevel% neq 0 (
    echo winget not found. Automatic installation is not available.
    echo Please install .NET 10 SDK and Node.js manually.
)
set /p APPROVE="Would you like to proceed with native Windows setup (installs missing dependencies)? (y/n): "
if /i not "!APPROVE!"=="y" (
    echo Setup cancelled by user.
    exit /b 0
)

if defined SDK_MISSING (
    echo .NET 10 SDK not found or incompatible version. Attempting to install via winget...
    winget install Microsoft.DotNet.SDK.10 --silent --accept-package-agreements --accept-source-agreements
    if %errorlevel% neq 0 (
        echo Failed to install .NET 10 SDK automatically.
        echo Please install it manually from https://dotnet.microsoft.com/download/dotnet/10.0
        pause
        exit /b 1
    )
    echo .NET 10 SDK installed successfully. Please restart your terminal.
) else (
    echo .NET 10 SDK is already installed:
    dotnet --version
)

if defined NODE_MISSING (
    echo Node.js not found. Attempting to install via winget...
    winget install OpenJS.NodeJS.LTS --silent --accept-package-agreements --accept-source-agreements
    if %errorlevel% neq 0 (
        echo Failed to install Node.js automatically.
        echo Please install it manually from https://nodejs.org/
        pause
        exit /b 1
    )
    echo Node.js installed successfully. Please restart your terminal if 'node' is still not recognized.
) else (
    echo Node.js is already installed:
    node -v
)

echo.
echo Setup complete!
