@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Miscrits-Web\Launch.ps1"
if errorlevel 1 pause
