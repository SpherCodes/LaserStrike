from pydantic import BaseModel

class User(BaseModel):
    id: str
    username: str
    kills: int = 0
    deaths: int = 0
    health: int = 100