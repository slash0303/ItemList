from flask import Flask, render_template, request, url_for, redirect, jsonify
from eaxtension import jsonE
from eaxtension import LogE

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

app = Flask(__name__)

@app.route("/", methods=["GET"])
def index_page():
    jsonE.load(DATA_DIR)
    return render_template(r"index.html")

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
    return redirect(url_for("index_page"))

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
    return redirect(url_for("index_page"))

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