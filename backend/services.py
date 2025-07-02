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

def process_shot(data: str) -> int | None:
    data_obj=json.loads(data)
    processed_data = model.process_image(data_obj["image"])
    if processed_data is None:
        print("Processed data is None")
        return None
    else:
        target_id, distance = processed_data
        if target_id not in users:
            print("Target ID not found")
            return False
        users[data_obj["player_id"]].kills += 1
        users[target_id].deaths +=1
        users[target_id].health -=1
        #TODO: update the display and add the photo of the shot
        return target_id