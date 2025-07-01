import json
from ComputerVision import Model
from models import User

PLAYER_IDS = {"A1", "A2", "A3", "A4"}
model = Model(PLAYER_IDS)
users = {}
# image object aka data, image and shooter_id
def add_user(new_user: User) -> None:
    users[new_user.id] = new_user

def list_users() -> dict:
    return users

def find_user(user_id: str) -> User:
    return users[user_id]

def remove_user(user_id: str) -> User:
    return users.pop(user_id)

def process_shot(data: str) -> bool:
    data_obj=json.loads(data)
    target_id=  model.process_image(data_obj["image"])
    if target_id is None:
        return False
    else:
        users[data_obj["shooter_id"]]["kills"] +=1
        users[target_id]["deaths"] +=1
        users[target_id]["health"] -=1
        #TODO: update the display and add the photo of the shot
        return True