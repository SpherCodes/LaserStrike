import json
from models import User

# Simplified services for deployment testing
# TODO: Re-enable ComputerVision when dependencies are sorted

users = {}

def add_user(new_user: User) -> None:
    users[new_user.id] = new_user

def remove_user(user_id: str) -> dict:
    if user_id in users:
        del users[user_id]
        return {"message": f"User {user_id} removed successfully"}
    return {"error": f"User {user_id} not found"}

def get_user(user_id: str) -> User | None:
    return users.get(user_id)

def list_users() -> dict:
    return users

def process_shot(image_data: str) -> dict:
    """
    Simplified shot processing for deployment testing.
    In production, this would process computer vision data.
    """
    try:
        # For now, return a mock response
        return {
            "status": "success",
            "message": "Shot processed (mock response)",
            "hit": True,
            "target_id": None,
            "damage": 1
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Shot processing failed: {str(e)}",
            "hit": False
        }
