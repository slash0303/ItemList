import { SubjectItemComponent, createSubjectComponent, FocusedElement } from "./subjectItemComponent.js";
import { dialogHandler, ViewState, attachStopPropagWithId, attachStopPropagWithClassAll } from "../common/modal.js";
import { getCookie } from "../common/cookie.js";

// Attach dialog handler as global function for using in HTML.
window.dialogHandler = dialogHandler;

// State manager of modal(dialog).
window.viewState = new ViewState();

// Get the id of user.
let userId = getCookie("user_id");

// Send request to server to get subject datas.
fetch(`/data/subjects/${userId}`).then((data) => {
    return data.json();
}).then((jsonData) => {
    let subject_names = Object.keys(jsonData);
    // Create subject elements in user's viewport.
    subject_names.forEach((subject_name) => {
        let date = jsonData[subject_name]["subject_date"];
        let description = jsonData[subject_name]["subject_description"];
        // let preview = Object.keys(data["category_name"]).slice(0, 3);
        let counter = jsonData[subject_name]["subject_process"];
        createSubjectComponent(subject_name, date, description, "nah", counter);
        return;
    });
}).then(() => {
    attachStopPropagWithClassAll("subject-menu-button");
    // Track the element which clicked recently.
    window.focusedElement = new FocusedElement();
});

let itemContainer = document.getElementById("item-container");
itemContainer.addEventListener("submit", (e) => {
    e.preventDefault();
    let target = e.submitter.parentElement;
    let subjectName = target.getAttribute("title");
    window.location = `/contents/${userId}/${subjectName}`;
});

// Prevent event propagation.
attachStopPropagWithId("add-dialog-bg");
attachStopPropagWithId("add-apply-button");
attachStopPropagWithId("modify-dialog-bg");

/** Shortcut key event */
document.addEventListener("keydown", (e) => {
    if (e.key == 'a' && e.ctrlKey && !window.viewState.dialogIsOpen) {
        e.preventDefault();
        dialogHandler("add", "open");
    }
    if (e.key == "Escape" && window.viewState.dialogIsOpen) {
        e.preventDefault();
        dialogHandler(viewState.currentDialog, "close");
    }
});

/** cancel submit because HTML form cannot send PATCH method */
let modifyDialogContainer = document.getElementById("modify-dialog-container");
modifyDialogContainer.addEventListener("submit", async (e) => {
    e.preventDefault();

    let moddedName = document.getElementById("modify-dialog-input-name")
    let moddedDescription = document.getElementById("modify-dialog-input-description");
    let originalName = document.getElementById("modify-dialog-original-name")

    let formBody = new FormData();
    formBody.append("modded_name", moddedName.value);
    formBody.append("modded_description", moddedDescription.value);
    formBody.append("original_name", originalName.value);

    const response = await fetch("/data/subjects",
        {
            method: "PATCH",
            body: formBody
        }
    );

    if (response.ok) {
        location.reload();
    }
    else {
        console.log(response);
    }
});