import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect,HTTPException,WebSocketException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.websockets import WebSocketState
from services import *  # Using original services with computer vision
from models import User

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
    
    def disconnect_everyone(self) -> None:
        self.active_connections.clear()

    async def broadcast(self, message: str) -> None:
        # Create a list to track connections that need to be removed
        closed_connections = []
        
        for connection in self.active_connections:
            try:
                # Only send to connections that are still open
                if connection.client_state == WebSocketState.CONNECTED:
                    await connection.send_text(message)
            except RuntimeError as e:
                # Connection is already closed, mark it for removal
                print(f"Failed to send message: {e}")
                closed_connections.append(connection)
            except Exception as e:
                # Other errors, also mark for removal
                print(f"Error broadcasting message: {e}")
                closed_connections.append(connection)
        
        # Remove any closed connections from active_connections
        for closed in closed_connections:
            if closed in self.active_connections:
                self.active_connections.remove(closed)

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

# TODO: secure these admin routes and the admin screen!
@app.get("/admin/images")
async def get_images():
    return list_recent_images()

@app.api_route("/admin/reset")
async def reset():
    reset_game()
    if len(list_users().keys())==0:
        c_manager.broadcast({"type":"game_reset","message":"Game has been reset by admin"})
        c_manager.disconnect_everyone()
        return {"status": "ok", "message": "Reset server"}
    return {"status": "Bad Request", "message": "Failed to reset server"}

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    try:
        if user_id not in list_users():
            raise WebSocketException(code=404, reason=f"User with user_id:{user_id} not found")
        await c_manager.connect(websocket)
        try:
           while True:
                data = await websocket.receive_text()
                target_id = process_shot(data)
                if isinstance(target_id, int):
                    killer = find_user(user_id)
                    target = find_user(target_id)
                    shot_obj = {'type': 'shot_event', 'killer': killer.__dict__, 'target': target.__dict__}
                    print(shot_obj)
                    await c_manager.broadcast(json.dumps(shot_obj))
                    await websocket.send_json({"success": True, "message": f"Shot hit player {target_id}"})
                else:
                    await websocket.send_json({"success": False, "message": "Shot missed"})
                    print("Shot missed")
        except WebSocketDisconnect:
            c_manager.disconnect(websocket)
    except WebSocketException as e:
        print(e)