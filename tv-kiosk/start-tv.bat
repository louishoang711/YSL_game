@echo off
rem Chạy game ở localhost rồi mở trình duyệt mặc định. Kéo cửa sổ sang màn hình dọc, bấm F11 để chơi.
rem Giữ cửa sổ đen này mở trong lúc chơi; đóng nó (hoặc Ctrl+C) là tắt server.
start "" /B node "%~dp0serve.mjs"
timeout /t 1 /nobreak >nul
start "" http://localhost:8765/
