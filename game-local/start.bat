@echo off
setlocal

rem YSL Holiday 26 - offline launcher
rem Opens index.html in a dedicated Chrome kiosk instance allowed to read local files

set "INDEX=%~dp0index.html"
set "PROFILE=%LOCALAPPDATA%\ysl-holiday-26-kiosk"
set "CHROME="

if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" set "CHROME=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if not defined CHROME if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" set "CHROME=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if not defined CHROME if exist "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe" set "CHROME=%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"
if not defined CHROME for /f "tokens=2,*" %%A in ('reg query "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe" /ve 2^>nul ^| findstr REG_SZ') do set "CHROME=%%B"
if not defined CHROME for /f "tokens=2,*" %%A in ('reg query "HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe" /ve 2^>nul ^| findstr REG_SZ') do set "CHROME=%%B"

if not defined CHROME (
  echo Google Chrome was not found on this PC.
  echo Please install Google Chrome and run start.bat again.
  pause
  exit /b 1
)

if not exist "%INDEX%" (
  echo index.html was not found next to start.bat.
  echo Please extract the whole zip into a folder and run start.bat from there.
  pause
  exit /b 1
)

start "" "%CHROME%" ^
  --allow-file-access-from-files ^
  --user-data-dir="%PROFILE%" ^
  --kiosk ^
  --no-first-run ^
  --no-default-browser-check ^
  --hide-crash-restore-bubble ^
  --autoplay-policy=no-user-gesture-required ^
  --overscroll-history-navigation=0 ^
  --disable-pinch ^
  --disable-features=Translate ^
  "%INDEX%"

endlocal
