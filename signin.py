from eaxtension import jsonE, LogE

USER_DATA_DIR = r"./static/data/user_data.json"

def check_user_data(user_id: str, user_pw: str) -> bool:
    user_id = f"{user_id}"
    user_pw = f"{user_pw}"
    # check user id
    user_data = jsonE.load(USER_DATA_DIR)
    if (not filter_string(user_id)) and (not filter_string(user_pw)):
        return False
    if user_id in user_data.keys():
        if user_data[user_id] == user_pw:
            return True
        else:
             return False


# Description: teh function to filtering user's input
def filter_string(victim:str) -> bool:
    for letter in victim:
        if letter.isalnum() or letter == "_":
            continue
        else:
            return False

    return True
