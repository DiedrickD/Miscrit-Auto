@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Miscrits-Web\Stop.ps1"
if errorlevel 1 pause
