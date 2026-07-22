try
	do shell script "curl -s --max-time 1 http://localhost:3001/api/status"
	-- If server is running, just open the frontend in browser
	do shell script "open http://localhost:5173"
on error
	-- If server is not running, start it in background and wait
	do shell script "cd '/Users/jaeyoung/Library/CloudStorage/GoogleDrive-jeminai951@gmail.com/내 드라이브/3. 스마트 오답노트/problem-note' && nohup npm run dev > /dev/null 2>&1 &"
	delay 2
	do shell script "open http://localhost:5173"
end try
