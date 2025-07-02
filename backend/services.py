import json
from ComputerVision import Model
from models import User

model = Model()
users = {}
recent_images = []
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
    image_data = data_obj["image"]
    processed_data = model.process_image(image_data)
    
    if processed_data is None:
        print("Processed data is None")
        return None
    else:
        target_id, distance = processed_data
        if target_id not in users:
            print("Target ID not found")
            return None
        users[data_obj["player_id"]].kills += 1
        users[target_id].deaths +=1
        users[target_id].health -=1
        users[data_obj["player_id"]].score += 10
        # Check if target is dead
        if users[target_id].health <= 0:
            users[target_id].isLive = False
        add_image(image_data)
        return target_id

def add_image(image: str) -> None:
    recent_images.insert(0,image)
    if (len(recent_images)>9):
        recent_images.pop()

def list_recent_images() -> str:
    return recent_images