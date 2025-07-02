import json
from ComputerVision import Model
from models import User

model = Model()
users = {}
# image object aka data, image and shooter_id
def add_user(new_user: User) -> None:
    users[new_user.id] = new_user

def list_users() -> dict:
    return users

def find_user(user_id: int) -> User:
    return users[user_id]

def remove_user(user_id: int) -> User:
    return users.pop(user_id)

def process_shot(data: str) -> dict:
    data_obj = json.loads(data)
    processed_data = model.process_image(data_obj["image"])
    
    if processed_data is None:
        return {"success": False, "message": "No target detected"}
    
    target_id, distance = processed_data
    player_id = data_obj.get("playerId")  # Match the client-side property name
    
    # Check if both IDs exist in users dictionary
    if player_id not in users:
        return {"success": False, "message": f"Shooter with ID {player_id} not found"}
        
    if target_id not in users:
        return {"success": False, "message": f"Target with ID {target_id} not found"}
    
    # Update player stats
    users[player_id].kills += 1
    users[target_id].deaths += 1
    users[target_id].health -= 1
    
    print(users)
    
    return {
        "success": True,
        "message": f"Hit registered! You shot player {target_id} from distance {distance}",
        "data": {
            "shooter": player_id,
            "target": target_id,
            "distance": distance
        }
    }