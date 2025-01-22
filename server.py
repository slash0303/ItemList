from flask import Flask, make_response, render_template, request, url_for, redirect, jsonify
from eaxtension import jsonE, LogE
import time

from signin import *

'''
[Route description]
...설명 보충해라
'''

# TODO: 나중에라도 유저 입력 validation test 추가하기

# Internal directories.
DATA_DIR = r"./static/data/data.json"
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
def redirect_to_landing():
    # TODO: 로그인 돼있으면 subjects로 리다이렉트
    return redirect(url_for("landing_page"))

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
    jsonE.dumps(f"./static/data/users/{user_id}.json", {})
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
    if not filter_string_list(user_id, user_pw) and not test_device_id_validation(user_device_id):
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
    expiration_time = set_expiration_time(1,0,0)
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
    # Check list from cookie.
    cookie_key_list = ["user_id", "device_id"]
    # Check cookie has keys which declared in key_list.
    for cookie_key in cookie_key_list:
        if not (cookie_key in cookie.keys()):
            LogE.d("wtf", cookie_key)
            return jsonify({"error": "rotten cookie"}), 401
    verification_value = {"user_id": session_storage[cookie["device_id"]],
                          "device_id": session_storage.keys()}
    response_code = check_cookie(cookie_key_list, cookie, verification_value)
    check_time_unexpired(int(cookie["expiration_time"]))
    if user_id != cookie["user_id"]:
        LogE.e("error", "siteid")
        return jsonify({"error": "you don't have a permission to access this content."}), 401
    
    # Respond to user.
    if response_code == 401:
        return redirect("/")
        # return jsonify({"error": "you don't have a permission to access this content."}), response_code
    elif response_code == 500:
        return redirect("/")
        # return jsonify({"error": "internal server error."})
    elif response_code == 200:
        # return render_template("subjects.html") 아직 미완성이라 바로 contents로
        return render_template("subjects.html")

# Test route
@app.route("/test")
def test():
    return render_template("subjects.html")

# Contents page.
@app.route("/contents/<user_id>/<subject_name>", methods=["GET"])
def contents_page(user_id, subject_name):
    session_storage = jsonE.load(SESSION_STORAGE_DIR)
    cookie = request.cookies
    # Check user id from cookie and URL
    if user_id != cookie["user_id"]:
        return redirect("/")

    # verificate user's cookie.
    cookie_key_list = ["user_id", "device_id"]
    verifiaction_value_list = {"user_id": session_storage[cookie["device_id"]],
                               "device_id": session_storage.keys()}
    response_code = check_cookie(cookie_key_list, cookie, verifiaction_value_list)
    LogE.e("resp", response_code)
    # Create response
    if response_code == 401:
        return redirect("/")
        # return jsonify({"error": "you don't have a permission to access this content."}), response_code
    elif response_code == 500:
        return redirect("/")
        # return jsonify({"error": "internal server error."})
    elif response_code == 200:
        if check_time_unexpired(int(cookie["expiration_time"])):
            remove_session(cookie["device_id"])
            LogE.e("error", "exptime")
            return redirect("/")
            # return jsonify({"error": "session expired."})
        else:
            return render_template("contents.html")
    
# Return 'subject' data to user.
@app.route("/data/subjects/<user_id>", methods=["GET"])
def send_subject_data_to_client(user_id):
    # Check user's cookie.
    session_storage = jsonE.load(SESSION_STORAGE_DIR);
    cookie_key_list = ["user_id", "device_id"]
    cookie = request.cookies
    verification_value_list = {"user_id": session_storage[cookie["device_id"]],
                               "device_id": session_storage.keys()}
    response_code = check_cookie(cookie_key_list, cookie, verification_value_list)
    # Create response
    if response_code == 401:
        return redirect("/")
        # return jsonify({"error": "you don't have a permission to access this content."}), response_code
    elif response_code == 500:
        return redirect("/")
        # return jsonify({"error": "internal server error."})
    elif response_code == 200:
        DATA_DIR = f"./static/data/users/{user_id}.json"
        data = jsonE.load(DATA_DIR)
        return data

# 
@app.route("/data/contents/<subject_name>", methods=["POST"])
def get_content_data_from_client(subject_name):
    user_id = request.cookies.get("user_id")
    DATA_DIR = f"./static/data/users/{user_id}.json"
    # get data of checked target from 'POST' request.
    target_category = request.form["category"]
    LogE.g("category", target_category)
    target_name = request.form["title"]
    LogE.d("target", f"{target_category}>{target_name}")
    # load data about list of item from 'data.json'
    data = jsonE.load(DATA_DIR)
    # modify item that already exist.
    if target_category in data.keys():
        if target_name in data[target_category].keys():
            # change state
            prev_state = data[target_category][target_name]["checked"]
            data[target_category][target_name]["checked"] = not prev_state
        else:
            data[target_category][target_name] = {"checked": False}
    # create new category and item
    else:
        data[target_category] = {}
        data[target_category][target_name] = {"checked": False}

    jsonE.dumps(DATA_DIR, data)
    return redirect(url_for("contents_page"))

# Return 'contents' data to user.
@app.route("/data/contents/<subject_name>", methods=["GET"])
def send_content_data_to_client(subject_name):
    user_id = request.cookies.get("user_id")
    DATA_DIR = f"./static/data/users/{user_id}.json"
    subject_data = jsonE.load(DATA_DIR)[subject_name]
    LogE.d("response", subject_data)
    return subject_data

# Process new 'content' add request in existing contents.
@app.route("/add/contents/<subject_name>", methods=["POST"])
def add_page(subject_name):
    user_id = request.cookies.get("user_id")
    DATA_DIR = f"./static/data/users/{user_id}.json"
    add_category = request.form["add_category"]
    add_item = request.form["add_item"]
    data = jsonE.load(DATA_DIR) 
    subject_data = data[subject_name]
    
    # modify item if it had already exist.
    if add_category in subject_data.keys():
        if add_item in subject_data[add_category].keys():
            # change state
            pass
        else:
            subject_data[add_category][add_item] = {"checked": False}
    # create new category and item
    else:
        subject_data[add_category] = {}
        subject_data[add_category][add_item] = {"checked": False}

    data[subject_name] = subject_data
    jsonE.dumps(DATA_DIR, data)
    return redirect(f"/contents/{subject_name}/{user_id}")

# Process request which remove particular 'content' from existing contents.
@app.route("/data/contents/<subject_name>", methods=["DELETE"])
def remove_item(subject_name):
    user_id = request.cookies.get("user_id")
    DATA_DIR = f"./static/data/users/{user_id}.json"
    target_item = request.args.get("title")
    target_category = request.args.get("category")
    LogE.d("target item", target_item)
    LogE.d("target category", target_category)

    data = jsonE.load(DATA_DIR)
    subject_data = data[subject_name]
    # remove item from loaded data.
    del subject_data[target_category][target_item]
    # if the category is empty, remove that too.
    if subject_data[target_category] == {}:
        del subject_data[target_category]
    data[subject_data] = subject_data
    jsonE.dumps(DATA_DIR, data)
    return jsonify({"message": "Item sucessfully removed"}), 200

# Process request which modify particular 'content' from existing contents.
@app.route("/data/contents/<subject_name>", methods=["PATCH"])
def modify_item(subject_name):
    user_id = request.cookies.get("user_id")
    DATA_DIR = f"./static/data/users/{user_id}.json"
    original_target_item = request.form["original_item"]
    original_target_category = request.form["original_category"]
    modded_target_item = request.form["modded_item"]
    modded_target_category = request.form["modded_category"]
    LogE.g("target item", f"{original_target_item} >> {modded_target_item}")
    LogE.g("target category", f"{original_target_category} >> {modded_target_category}")
    
    data = jsonE.load(DATA_DIR)
    subject_data = data[subject_name]

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
        del subject_data[original_target_category][original_target_item]
        # if the category is empty, remove that too.
        if subject_data[original_target_category] == {}:
            del subject_data[original_target_category]
        if not modded_target_category in data.keys():
            subject_data[modded_target_category] = {}
        subject_data[modded_target_category][modded_target_item] = {"checked": False}
    except KeyError:
        return jsonify({"error": "Key error"}), 404
    
    data[subject_name] = subject_data
    jsonE.dumps(DATA_DIR, data)
    return jsonify({"message": "Modification sucessful"}), 200


if __name__ == "__main__":
    app.run(debug=True)