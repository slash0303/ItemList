from eaxtension import jsonE, LogE
import random
import time as t
from hashlib import md5

USER_DATA_DIR = r"./static/data/user_data.json"
SESSION_STORAGE_DIR = r"./static/data/session_storage.json"

# Description: A function to filtering user input
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

# Description: A function to filtering multiple user inputs.
def filter_string_list(*victims) -> bool:
    for victim in victims:
        if not filter_string(victim):
            return False
        else:
            continue
    return True
        
# Description: A function which act as generator of random string based on id and pw. 
def create_cookie_value(user_id: str, user_pw: str) -> str:
    return str(md5((str(random.random()) + user_id + user_pw).encode()).hexdigest())

# Description: A function which set expiration time.
def set_expiration_time(day: int, hr: int, min: int, sec: int) -> int:
    target_time = sec + min*60 + hr*3600 + day*3600*24
    current_time = t.time()

    return int(current_time + target_time)

# Description: Check expiration time of session is over the current time.
def check_time_expired(expiration_time: int) -> bool:
    if expiration_time > int(t.time()):
        return False
    else:
        return True

# Description: Remove selected session from session storage.
def remove_session(device_id: str):
    session_storage = jsonE.load(SESSION_STORAGE_DIR)
    del session_storage[device_id]
    jsonE.dumps(SESSION_STORAGE_DIR, session_storage)

def check_cookie(cookie_keys: list, user_cookie, verification_value: dict) -> int:
    if len(cookie_keys) != len(verification_value):
        LogE.e(f"Number of elements({len(cookie_keys)}, {len(verification_value)})", "length cookie keys and verfication value doesn't match.")
        return 500
    
    for cookie_key in cookie_keys:
        # Check integrity of cookie.
        if not cookie_key in user_cookie.keys():
            LogE.e("Cookie has problem", f"user cookie doesn't have '{cookie_key}'.")
            return 401
        # Check expiration time.
        if cookie_key == "expiration_time":
            if check_time_expired(int(user_cookie[cookie_key])):
                LogE.e("Rotten cookie", "expired")
                return 401
        # Check cookie's value with verification value.
        if (type(verification_value[cookie_key]) == list) or (type(verification_value[cookie_key]) == type({}.keys())):
            if not user_cookie[cookie_key] in verification_value[cookie_key]:
                LogE.e("Cookie value(list or dict_keys)", f"'{cookie_key}' doesn't match with verification value.")
                return 401
        elif type(verification_value[cookie_key]) == dict:
            if not user_cookie[cookie_key] in verification_value[cookie_key].keys():
                LogE.e("Cookie value(dict)", f"'{cookie_key}' doesn't match with verification value.")
                return 401
        else:
            if str(user_cookie[cookie_key]) != str(verification_value[cookie_key]):
                LogE.e("Cookie value", f"'{cookie_key}' doesn't match with verification value.")
                return 401
            
    LogE.g("Cookie passed", "return code 200")
    return 200

# Description: Create verification value which used in cookie check.
def create_verfication_value(keys: list, session_data: dict, cookie: dict):
    # check cookie to set 'finding level'.
    finding_level = 0
    allowed_keys = []
    cookie_keys = cookie.keys()
    if "device_id" in cookie_keys:
        finding_level = 1
        allowed_keys.append("device_id")
    if "user_id" in cookie_keys:
        finding_level = 2
        allowed_keys.append("user_id")
    if "cookie_value" in cookie_keys and "expiration_time" in cookie_keys:
        finding_level = 3
        allowed_keys.append("cookie_value")
        allowed_keys.append("expiration_time")
    
    LogE.d("finding_level", finding_level)
    
    verfication_value = {}

    for key in keys:
        # Only can find 'device_id'
        if finding_level >= 0:
            if key == "device_id":
                verfication_value[key] = session_data.keys()
                continue
        else:
            if not key in allowed_keys:
                LogE.e("finding level error", f"You cannot find {key} in level {finding_level}.")
        
        # Also can find 'user_id'
        if finding_level >= 1:
            # Set the value of variable which named 'device_id'
            device_id = cookie["device_id"]
            if not device_id in session_data.keys():
                LogE.e("cannot find data", f"cannot found 'device_id({device_id})' in session_data")
                continue
            if key == "user_id":
                verfication_value[key] = session_data[device_id]
                continue
        else:
            if not key in allowed_keys:
                LogE.e("finding level error", f"You cannot find {key} in level {finding_level}.")

        # Can find all of data.
        if finding_level >= 2:
            # 레벨별로 동작 적고 안 맞는 키 반려하는데, 레벨2는 안 맞는 키가 없구나, 위에서 못 찾으면 빠꾸 시키는걸로 ㅇㅇ
            user_id = cookie["user_id"]
            if key == "expiration_time" or key == "cookie_value":                
                verfication_value[key] = session_data[device_id][user_id][key]
                continue
        else:
            if not key in allowed_keys:
                LogE.e("key error", "finding level is maximum, but cannot find matched data from session_storage.")

    return verfication_value