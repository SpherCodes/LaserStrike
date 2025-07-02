import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect,HTTPException,WebSocketException
from fastapi.middleware.cors import CORSMiddleware
from services import *  # Using original services with computer vision
from models import User

# TODO: broadcast killer:player object,dead:player object
# TODO: update both players after successful shot, add images of successful shot
# TODO: spectator view
# TODO: single git ignore and readme

class ConnectionManager:
    def __init__(self) -> None:
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket) -> None:
        self.active_connections.remove(websocket)
        if len(self.active_connections) == 0:
            print("No active connections")

    async def broadcast(self, message: str) -> None:
        for connection in self.active_connections:
            await connection.send_text(message)

    @staticmethod
    async def send_text(message: str, websocket: WebSocket) -> None:
        await websocket.send_text(message)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

c_manager = ConnectionManager()

@app.get("/")
async def health():
    return {"status": "ok","message": "Service is running"}

@app.post("/users")
async def create_user(new_user: User):
    add_user(new_user)
    return {"message": "User created successfully", "user": new_user}

@app.get("/users")
async def get_users():
    return list_users()

@app.get("/users/{user_id}")
async def get_user(user_id: int):
    try:
        if user_id not in list_users():
            raise HTTPException(status_code=404, detail=f"User with user_id:{user_id} not found")
        return find_user(user_id)
    except HTTPException as e:
        print(e)
        return {"message": f"User with user_id:{user_id} not found"}


@app.delete("/users/{user_id}")
async def delete_user(user_id: int):
    try:
        if user_id not in list_users():
            raise HTTPException(status_code=404, detail=f"User with user_id:{user_id} not found")
        return remove_user(user_id)
    except HTTPException as e:
        print(e)
        return {"message": f"User with user_id:{user_id} not found"}

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    try:
        if user_id not in list_users():
            raise WebSocketException(code=404, reason=f"User with user_id:{user_id} not found")
        await c_manager.connect(websocket)
        try:
           while True:
                data = await websocket.receive_text()
                await websocket.send_json(json.dumps(str(process_shot(data))))
        except WebSocketDisconnect:
            c_manager.disconnect(websocket)
    except WebSocketException as e:
        print(e)