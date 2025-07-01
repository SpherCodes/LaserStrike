from fastapi import FastAPI, WebSocket, WebSocketDisconnect,HTTPException,WebSocketException
from fastapi.middleware.cors import CORSMiddleware

from models import User

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

users = {}

@app.get("/")
async def health():
    return {"status": "ok","message": "Service is running"}

@app.post("/users")
async def create_user(new_user: User):
    users[new_user.id] = new_user
    print(f"User created: {new_user.id} - {new_user.name}")
    return {"message": "User created successfully", "user": new_user}

@app.get("/users")
async def get_users():
    return users

@app.get("/users/{user_id}")
async def get_user(user_id: str):
    if user_id not in users:
        raise HTTPException(status_code=404, detail=f"User with user_id:{user_id} not found")
    return users[user_id]

@app.delete("/users/{user_id}")
async def delete_user(user_id: str):
    if user_id not in users:
        raise HTTPException(status_code=404, detail=f"User with user_id:{user_id} not found")
    return users.pop(user_id)

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    if user_id not in users:
        raise WebSocketException(code=404, reason=f"User with user_id:{user_id} not found")
    await c_manager.connect(websocket)
    try:
       while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        c_manager.disconnect(websocket)