from flask import Flask, render_template, request, url_for, redirect, jsonify
from eaxtension import jsonE, LogE

from signin import check_user_data, filter_string

'''
[Route description]
/ : main page of web site.
/data : request data 
/add : add data
/remove : remove data
...설명 보충해라
'''

# TODO: 나중에라도 유저 입력 validation test 추가하기

DATA_DIR = r"./static/data/data.json"
USER_DATA_DIR = r"./static/data/user_data.json"

app = Flask(__name__)

@app.route("/landing", methods=["GET"])
def landing_page():
    return render_template(r"landing.html")

@app.route("/login", methods=["GET"])
def login_page():
    return render_template(r"login.html")

@app.route("/signup", methods=["POST"])
def process_signup():
    user_name = request.form["user_name"]
    user_id = request.form["user_id"]
    user_pw = request.form["user_pw"]
    jsonE.load("./static/data")
    # TODO: 기능 완성하기

@app.route("/signin", methods=["POST"])
def process_signin():
    user_id = request.form["user_id"]
    user_pw = request.form["user_pw"]
    user_id = f"{user_id}"
    user_pw = f"{user_pw}"
    # TODO: 세션 생성하고 토큰 주기
    if check_user_data(user_id, user_pw):
        return redirect(url_for(f"/subjects/{user_id}"))

@app.route("/subjects/<user_id>", methods=["GET"])
def subjects_page(user_id):
    user_id = f"{user_id}"
    # TODO: token 검사(로그인 여부 확인하란 뜻)
    if filter_string(user_id):
        return render_template(f"/contents/{user_id}")

@app.route("/", methods=["GET"])
def redirect_to_landing():
    # TODO: 로그인 돼있으면 subjects로 리다이렉트
    return redirect(url_for("landing_page"))

@app.route("/contents/<user_id>", methods=["GET"])
def contents_page(user_id):
    return render_template(r"contents.html")

@app.route("/data", methods=["POST"])
def get_data_from_client():
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

@app.route("/data", methods=["GET"])
def send_data_to_client():
    data = jsonE.load(DATA_DIR)
    return data

@app.route("/add", methods=["POST"])
def add_page():
    add_category = request.form["add_category"]
    add_item = request.form["add_item"]
    data = jsonE.load(DATA_DIR) 
    
    # modify item if it had already exist.
    if add_category in data.keys():
        if add_item in data[add_category].keys():
            # change state
            pass
        else:
            data[add_category][add_item] = {"checked": False}
    # create new category and item
    else:
        data[add_category] = {}
        data[add_category][add_item] = {"checked": False}

    jsonE.dumps(DATA_DIR, data)
    return redirect(url_for("contents"))

@app.route("/data", methods=["DELETE"])
def remove_item():
    target_item = request.args.get("title")
    target_category = request.args.get("category")
    LogE.d("target item", target_item)
    LogE.d("target category", target_category)

    data = jsonE.load(DATA_DIR)
    # remove item from loaded data.
    del data[target_category][target_item]
    # if the category is empty, remove that too.
    if data[target_category] == {}:
        del data[target_category]
    jsonE.dumps(DATA_DIR, data)
    return jsonify({"message": "Item sucessfully removed"}), 200

@app.route("/data", methods=["PATCH"])
def modify_item():
    original_target_item = request.form["original_item"]
    original_target_category = request.form["original_category"]
    modded_target_item = request.form["modded_item"]
    modded_target_category = request.form["modded_category"]
    LogE.g("target item", f"{original_target_item} >> {modded_target_item}")
    LogE.g("target category", f"{original_target_category} >> {modded_target_category}")
    
    data = jsonE.load(DATA_DIR)

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
        del data[original_target_category][original_target_item]
        # if the category is empty, remove that too.
        if data[original_target_category] == {}:
            del data[original_target_category]
        if not modded_target_category in data.keys():
            data[modded_target_category] = {}
        data[modded_target_category][modded_target_item] = {"checked": False}
    except KeyError:
        return jsonify({"error": "Key error"}), 404
    
    jsonE.dumps(DATA_DIR, data)
    return jsonify({"message": "Modification sucessful"}), 200


if __name__ == "__main__":
    app.run(debug=True)