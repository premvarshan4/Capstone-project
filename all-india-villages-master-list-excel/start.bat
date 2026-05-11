@echo off
start cmd /k "cd /d "C:\Users\parva\Downloads\zip file\all-india-villages-master-list-excel\backend" && npm run dev"
timeout /t 3 /nobreak
start cmd /k "cd /d "C:\Users\parva\Downloads\zip file\all-india-villages-master-list-excel\frontend" && npm start"