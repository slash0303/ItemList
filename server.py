from flask import Flask, make_response, render_template, request, url_for, redirect, jsonify
from eaxtension import jsonE, LogE
import time

from signin import *

'''
[Route description]
...설명 보충해라
'''

# Internal directories.
DATA_DIR = ""
def get_data_dir(user_id: str) -> str:
    return f"./static/data/users/{user_id}.json"

USER_DATA_DIR = r"./static/data/user_data.json"
SESSION_STORAGE_DIR = r"./static/data/session_storage.json"

# Create Flask instance.
app = Flask(__name__)

# Landing page
@app.route("/landing", methods=["GET"])
def landing_page():
    return render_template(r"landing.html")

# Redirect to landing. modify required.
@app.route("/", methods=["GET"])
def root():
    cookie = request.cookies
    key_check = True
    for key in ["device_id", "user_id", "expiration_time"]:
        if not key in cookie.keys():
            key_check = False
    if key_check:
        device_id = cookie["device_id"]
        user_id = cookie["user_id"]
        session_storage = jsonE.load(SESSION_STORAGE_DIR)
        cookie_keys = ["user_id", "device_id", "expiration_time"]
        verification_value = create_verfication_value(cookie_keys, session_storage, cookie)
        response_code = check_cookie(cookie_keys, cookie, verification_value)
        # TODO: 로그인 돼있으면 subjects로 리다이렉트
        return redirect(f"/subjects/{user_id}")
    else:
        return redirect("/landing")

# Login page.
@app.route("/login", methods=["GET"])
def login_page():
    return render_template(r"login.html")

# Process 'sign up' request.
@app.route("/signup", methods=["POST"])
def process_signup():
    # Get account data from user's request.
    user_name = request.form["user_name"]
    user_id = request.form["user_id"]
    user_pw = request.form["user_pw"]
    
    user_data = jsonE.load(USER_DATA_DIR)
    # filter ID duplication.
    if user_id in user_data.keys():
        return jsonify({"error": "ID already exists."}), 409
    else:
        pass
    # filter user's input to prevent injection attack.
    if not filter_string_list(user_name, user_id, user_pw):
        return jsonify({"error": "user_text_doesn't match in codition."}), 409
    else:
        pass
    # add account.
    user_data[user_id] = {"user_name": user_name, 
                          "user_pw": user_pw}
    jsonE.dumps(USER_DATA_DIR, user_data)
    # Create new file to store user's data.
    jsonE.dumps(get_data_dir(user_id), {})
    return redirect(url_for("landing_page"))

# Process 'sign in' request.
@app.route("/signin", methods=["POST"])
def process_signin():
    # Get user identification data from cookie.
    user_device_id = request.form["device_id"]
    user_id = request.form["user_id"]
    user_pw = request.form["user_pw"]

    hashed_device_id = str(md5(user_device_id.encode()).hexdigest())

    # Filter user's input
    if not filter_string_list(user_id, user_pw):
        return jsonify({"error": "validate input"}), 409
    # Load session_storage and user_data
    session_storage = jsonE.load(SESSION_STORAGE_DIR)
    user_data = jsonE.load(USER_DATA_DIR)
    # Check ID and PW
    if not (user_id in user_data.keys()):
        return jsonify({"error": "ID doesn't exist."}), 404
    if user_data[user_id]["user_pw"] != user_pw:
        return jsonify({"error": "PW doesn't match."}), 400
    # Create cookie and set expiration time
    cookie_value = create_cookie_value(user_id, user_pw)
    expiration_time = set_expiration_time(1,1,0,0)
    # Create response and set cookie
    resp = make_response(redirect(f"subjects/{user_id}"))
    resp.set_cookie("user_id", user_id)
    resp.set_cookie("device_id", hashed_device_id)
    resp.set_cookie("value", cookie_value)
    resp.set_cookie("expiration_time", str(expiration_time))
    # Store in session storage
    session_storage[hashed_device_id] = {
        user_id:{
            "cookie_value": cookie_value,
            "expiration_time": expiration_time
        }
    }
    # save session data in session storage.
    jsonE.dumps(SESSION_STORAGE_DIR, session_storage)
    return resp

# Subject page
@app.route("/subjects/<user_id>", methods=["GET"])
def subjects_page(user_id):
    # Load validation of session.
    session_storage = jsonE.load(SESSION_STORAGE_DIR)
    
    # Get user data from cookie.
    cookie = request.cookies
    device_id = cookie["device_id"]
    # Check list from cookie.
    cookie_keys = ["user_id", "device_id", "expiration_time"]
    # Check cookie has keys which declared in key_list.
    for cookie_key in cookie_keys:
        if not (cookie_key in cookie.keys()):
            LogE.d("wtf", cookie_key)
            return jsonify({"error": "rotten cookie"}), 401
    verification_value = create_verfication_value(cookie_keys, session_storage, cookie)
    response_code = check_cookie(cookie_keys, cookie, verification_value)
    if check_time_expired(int(cookie["expiration_time"])):
        return jsonify({"Rotten cookie": "Session has been expired."})
    if user_id != cookie["user_id"]:
        LogE.e("error", "siteid")
        return jsonify({"error": "you don't have a permission to access this content."}), 401
    
    # Respond to user.
    if response_code == 401:
        return jsonify({"error": "you don't have a permission to access this content."}), response_code
    elif response_code == 500:
        return jsonify({"error": "internal server error."})
    elif response_code == 200:
        return render_template("subjects.html")

# Test route: deprecated.
"""
@app.route("/test")
def test():
    return render_template("subjects.html")
"""

# Contents page
@app.route("/contents/<user_id>/<subject_name>", methods=["GET"])
def contents_page(user_id, subject_name):
    session_storage = jsonE.load(SESSION_STORAGE_DIR)
    cookie = request.cookies
    device_id = cookie["device_id"]
    # Check user id from cookie and URL
    if user_id != cookie["user_id"]:
        LogE.e("user id doesn't match", f"url: {user_id}, cookie: {cookie["user_id"]}")
        return redirect("/")

    # verificate user's cookie.
    cookie_key_list = ["user_id", "device_id"]
    if not device_id in session_storage.keys():
        return redirect("/"), 401
    verifiaction_value_list = {"user_id": session_storage[device_id],
                               "device_id": session_storage.keys()}
    response_code = check_cookie(cookie_key_list, cookie, verifiaction_value_list)
    LogE.d("content page: response code", response_code)
    # Create response
    if response_code == 401:
        return redirect("/")
        # return jsonify({"error": "you don't have a permission to access this content."}), response_code
    elif response_code == 500:
        return redirect("/")
        # return jsonify({"error": "internal server error."})
    elif response_code == 200:
        if check_time_expired(int(cookie["expiration_time"])):
            remove_session(cookie["device_id"])
            LogE.e("error", "exptime")
            return redirect("/")
            # return jsonify({"error": "session expired."})
        else:
            return render_template("contents.html")
        
# Process new 'content' add request in subject.
@app.route("/add/contents/<subject_name>", methods=["POST"])
def add_content_element(subject_name):
    # Get user's data from cookie.
    cookie = request.cookies
    user_id = cookie["user_id"]
    device_id = cookie["device_id"]

    session_storage = jsonE.load(SESSION_STORAGE_DIR)

    cookie_keys = ["user_id", "device_id", "expiration_time"]
    verification_value = create_verfication_value(cookie_keys, session_storage, cookie)
    response_code = check_cookie(cookie_keys, cookie, verification_value)

    if response_code == 401 or response_code == 500:
        return jsonify({"unautorized": "cannot add content."})

    # Load data
    DATA_DIR = get_data_dir(user_id)
    # Get data of new content from user's request.
    add_category = request.form["add_category"]
    add_item = request.form["add_item"]
    
    data = jsonE.load(DATA_DIR) 
    content_data = data[subject_name]["contents"]
    
    # modify item if it had already exist.
    if add_category in content_data.keys():
        if add_item in content_data[add_category].keys():
            # change state
            pass
        else:
            content_data[add_category][add_item] = {"checked": False}
    # create new category and item
    else:
        content_data[add_category] = {}
        content_data[add_category][add_item] = {"checked": False}

    data[subject_name]["contents"] = content_data
    jsonE.dumps(DATA_DIR, data)
    return redirect(f"/contents/{user_id}/{subject_name}")

# Process new 'subject' add request.
@app.route("/add/subjects", methods=["POST"])
def add_subject_element():
    # Get user's data from cookie
    cookie = request.cookies
    user_id = cookie["user_id"]
    device_id = cookie["device_id"]
    
    # Check login session and access permission.
    session_storage = jsonE.load(SESSION_STORAGE_DIR)

    cookie_keys = ["user_id", "device_id", "expiration_time"]
    verification_value = create_verfication_value(cookie_keys, session_storage, cookie)
    
    response_code = check_cookie(cookie_keys, cookie, verification_value)
    if response_code == 401 or response_code == 500:
        return jsonify({"unauthorized", "cannot add subject."})

    # Get data of new subject data from form.
    subject_name = request.form["subject_name"]
    subject_description = request.form["subject_description"]

    DATA_DIR = get_data_dir(user_id)
    data = jsonE.load(DATA_DIR)
    if subject_name in data.keys():
        return jsonify({"Cannot add subject": "Subject already exist."})
    else:
        data[subject_name] = {"subject_description":subject_description, 
                              "contents":{}}
        jsonE.dumps(DATA_DIR, data)
        return redirect(f"/contents/{user_id}/{subject_name}")
    
# Return 'subject' data to user.
@app.route("/data/subjects/<user_id>", methods=["GET"])
def send_subject_data_to_client(user_id):
    # Check user's cookie.
    session_storage = jsonE.load(SESSION_STORAGE_DIR);
    cookie_key_list = ["user_id", "device_id", "expiration_time"]
    cookie = request.cookies
    device_id = cookie["device_id"]
    user_id = cookie["user_id"]
    verification_value_list = {"user_id": session_storage[device_id],
                               "device_id": session_storage.keys(),
                               "expiration_time": session_storage[device_id][user_id]["expiration_time"]}
    response_code = check_cookie(cookie_key_list, cookie, verification_value_list)
    # Create response
    if response_code == 401:
        return redirect("/")
        # return jsonify({"error": "you don't have a permission to access this content."}), response_code
    elif response_code == 500:
        return redirect("/")
        # return jsonify({"error": "internal server error."})
    elif response_code == 200:
        DATA_DIR = get_data_dir(user_id)
        data = jsonE.load(DATA_DIR)
        return data

# Process Checked request in contents page.
@app.route("/data/contents/<subject_name>", methods=["POST"])
def get_content_data_from_client(subject_name):
    user_id = request.cookies.get("user_id")
    DATA_DIR = get_data_dir(user_id)
    # get data of checked target from 'POST' request.
    target_category = request.form["category"]
    LogE.g("category", target_category)
    target_name = request.form["title"]
    LogE.d("target", f"{target_category}>{target_name}")
    # load data about list of item from 'data.json'
    data = jsonE.load(DATA_DIR)
    content_data = data[subject_name]["contents"]
    # modify item that already exist.
    if target_category in content_data.keys():
        if target_name in content_data[target_category].keys():
            # change state
            prev_state = content_data[target_category][target_name]["checked"]
            content_data[target_category][target_name]["checked"] = not prev_state
        else:
            content_data[target_category][target_name] = {"checked": False}
    # create new category and item
    else:
        content_data[target_category] = {}
        content_data[target_category][target_name] = {"checked": False}

    data[subject_name]["contents"] = content_data
    jsonE.dumps(DATA_DIR, data)
    return redirect(f"/contents/{user_id}/{subject_name}")

# Return 'contents' data to user.
@app.route("/data/contents/<subject_name>", methods=["GET"])
def send_content_data_to_client(subject_name):
    user_id = request.cookies.get("user_id")
    DATA_DIR = get_data_dir(user_id)
    content_data = jsonE.load(DATA_DIR)[subject_name]["contents"]
    LogE.d("response", content_data)
    return content_data

# Process request which remove particular 'content' from existing contents.
@app.route("/data/contents/<subject_name>", methods=["DELETE"])
def remove_item(subject_name):
    user_id = request.cookies.get("user_id")
    DATA_DIR = get_data_dir(user_id)
    target_item = request.args.get("title")
    target_category = request.args.get("category")
    LogE.d("target item", target_item)
    LogE.d("target category", target_category)

    data = jsonE.load(DATA_DIR)
    content_data = data[subject_name]["contents"]
    # remove item from loaded data.
    del content_data[target_category][target_item]
    # if the category is empty, remove that too.
    if content_data[target_category] == {}:
        del content_data[target_category]
    data[subject_name]["contents"] = content_data
    jsonE.dumps(DATA_DIR, data)
    return jsonify({"message": "Item sucessfully removed"}), 200

# Process request which modify particular 'content' from existing contents.
@app.route("/data/contents/<subject_name>", methods=["PATCH"])
def modify_item(subject_name):
    user_id = request.cookies.get("user_id")
    DATA_DIR = get_data_dir(user_id)
    original_target_item = request.form["original_item"]
    original_target_category = request.form["original_category"]
    modded_target_item = request.form["modded_item"]
    modded_target_category = request.form["modded_category"]
    LogE.g("target item", f"{original_target_item} >> {modded_target_item}")
    LogE.g("target category", f"{original_target_category} >> {modded_target_category}")
    
    data = jsonE.load(DATA_DIR)
    content_data = data[subject_name]["contents"]

    if modded_target_category == "" and modded_target_item == "":
        return jsonify({"error": "At least one field must be filled in"}), 404
    elif modded_target_category == "":
        modded_target_category = original_target_category
    elif modded_target_item == "":
        modded_target_item = original_target_item
    else:
        pass

    # find original data
    try:
        # remove item from loaded data.
        del content_data[original_target_category][original_target_item]
        # if the category is empty, remove that too.
        if content_data[original_target_category] == {}:
            del content_data[original_target_category]
        if not modded_target_category in data.keys():
            content_data[modded_target_category] = {}
        content_data[modded_target_category][modded_target_item] = {"checked": False}
    except KeyError:
        return jsonify({"error": "Key error"}), 404
    
    data[subject_name]["contents"] = content_data
    jsonE.dumps(DATA_DIR, data)
    return jsonify({"message": "Modification sucessful"}), 200

@app.route("/data/subjects", methods=["PATCH"])
def modify_subject():
    # Check user's data.
    cookie = request.cookies
    cookie_keys = ["device_id", "user_id", "expiration_time"]

    session_storage = jsonE.load(SESSION_STORAGE_DIR)

    verification_value = create_verfication_value(cookie_keys, session_storage, cookie)
    response_code = check_cookie(cookie_keys, cookie, verification_value)
    
    if response_code == 200:
        # Load saved data from internal storage.
        user_id = cookie["user_id"]
        DATA_DIR = get_data_dir(user_id)
        data = jsonE.load(DATA_DIR)
        
        # Retrieves data about modification from user's request.
        original_target_name = request.form["original_name"]
        modded_target_name = request.form["modded_name"]
        modded_target_description = request.form["modded_description"]

        LogE.d("original", original_target_name)
        LogE.d("modded", modded_target_description+"_"+modded_target_name)

        # Modify saved data.
        if original_target_name in data.keys():
            temporary_data = data[original_target_name]
            del data[original_target_name]
            if modded_target_description != "":
                temporary_data["subject_description"] = modded_target_description
            data[modded_target_name] = temporary_data
            jsonE.dumps(DATA_DIR, data)
            return jsonify({"data modded.": response_code}), response_code
        else:
            response_code = 404
            LogE.e(f"Key error({response_code})", "cannot found target name.")
            return jsonify({"error": "cannot found target name."}), 404
    else:
        return jsonify({"error": response_code}), response_code

# Main
if __name__ == "__main__":
    app.run(debug=True)