from flask import Flask, render_template, request, url_for, redirect
from eaxtension import jsonE
from eaxtension import LogE

app = Flask(__name__)

@app.route("/", methods=["GET"])
def index_page():
    jsonE.load(r"./static/data/data.json")
    return render_template(r"index.html")

@app.route("/data", methods=["POST"])
def get_data_from_client():
    # get data of checked target from 'POST' request.
    target_category = request.form["category"]
    LogE.g("category", target_category)
    target_name = request.form["title"]
    LogE.d("target", f"{target_category}>{target_name}")
    # load data about list of item from 'data.json'
    data = jsonE.load(r"./static/data/data.json")
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

    jsonE.dumps(r"./static/data/data.json", data)
    return redirect(url_for("index_page"))

@app.route("/data", methods=["GET"])
def send_data_to_client():
    data = jsonE.load(r"./static/data/data.json")
    return data

@app.route("/add", methods=["POST"])
def add_page():
    add_category = request.form["add_category"]
    add_item = request.form["add_item"]
    data = jsonE.load(r"./static/data/data.json")
    
    # modify item that already exist.
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

    # data[add_category] = {}
    # data[add_category][add_item] = {"checked": False}
    jsonE.dumps(r"./static/data/data.json", data)
    return redirect(url_for("index_page"))

if __name__ == "__main__":
    app.run(debug=True)