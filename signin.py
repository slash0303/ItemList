from eaxtension import jsonE, LogE
import random
import time as t
from hashlib import md5

USER_DATA_DIR = r"./static/data/user_data.json"
SESSION_STORAGE_DIR = r"./static/data/session_storage.json"

# Description: teh function to filtering user's input
def filter_string(victim:str) -> bool:
    for letter in victim:
        
        if letter.isalnum() or letter == "_":
            continue
        else:
            return False

    if victim != f"{victim}":
        return False
    else:
        return True

def filter_string_list(*victims) -> bool:
    for victim in victims:
        if not filter_string(victim):
            return False
        else:
            continue
    return True
        
def create_cookie_value(user_id: str, user_pw: str) -> str:
    return str(md5((str(random.random()) + user_id + user_pw).encode()).hexdigest())

def set_expiration_time(hr, min, sec) -> int:
    target_time = sec + min*60 + hr*3600
    current_time = t.time()

    return int(current_time + target_time)

def test_device_id_validation(raw_device_id: str) -> bool:
    DEVICE_LENGTH_LIMIT = 2
    splited_id = raw_device_id.split("-")
    if len(splited_id) != DEVICE_LENGTH_LIMIT:
        return False
    else:
        return True
    
def check_time_unexpired(expiration_time: int) -> bool:
    if expiration_time > int(t.time()):
        return False
    else:
        return True
    
def remove_session(device_id: str):
    session_storage = jsonE.load(SESSION_STORAGE_DIR)
    del session_storage[device_id]
    jsonE.dumps(SESSION_STORAGE_DIR, session_storage)

