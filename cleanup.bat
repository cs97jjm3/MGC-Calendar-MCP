@echo off
echo ================================================
echo MGC Calendar - Project Cleanup
echo ================================================
echo.

cd C:\Users\murre\Documents\GitHub\mgc-calendar-mcp

echo Deleting troubleshooting files...
del DISCONNECTION-FIX.md 2>nul
del LOGGING-UPDATE.md 2>nul
del SQL-JS-FIX.md 2>nul
del OFFICIAL-PACKAGING.md 2>nul
del PUBLISHING-CHECKLIST.md 2>nul
del QUICK-ACTIONS.md 2>nul
del UPDATES-NEEDED.md 2>nul
del CLEANUP-LIST.md 2>nul
del diagnose.bat 2>nul
del fix-mcpb.bat 2>nul
del manifest-test.json 2>nul

echo.
echo Cleanup complete!
echo.
echo Final documentation structure:
echo   - README.md
echo   - ROADMAP.md
echo   - CHANGELOG.md
echo   - CONTRIBUTING.md
echo   - ARCHITECTURE.md
echo   - TROUBLESHOOTING.md
echo   - MCPB-PACKAGING.md
echo   - LICENSE
echo.
pause
