# How to run locally 
## How to run Frontend:
1. cd frontend\laserstrike
2. npm i
3. npm run dev
4. open http://localhost:3000/
5. to reset the game to go http://localhost:3000/admin and enter the admin password which is laser123

## How to run Backend:
1. cd backend
2. pip install -r requirements.txt
3. uvicorn main:app --reload
4. you should see {"status":"ok","message":"Service is running"} at http://127.0.0.1:8000/

# How to join the game online
- go to https://laserstrike.vercel.app to login as a player
- to reset the game go to https://laserstrike.vercel.app/admin and enter the admin password which is laser123
