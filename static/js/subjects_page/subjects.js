import { SubjectItemComponent, createSubjectComponent } from "./subjectItemComponent.js";
import { dialogHandler, attachStopPropagWithId } from "../common/modal.js";
import { getCookie } from "../common/cookie.js";

// Attach dialog handler as global function for using in HTML.
window.dialogHandler = dialogHandler;

attachStopPropagWithId("add-dialog-bg");
attachStopPropagWithId("add-apply-button");


// Get the id of user.
let userId = getCookie("user_id");

// Send request to server to get subject datas.
fetch(`/data/subjects/${userId}`).then((data)=>{
    return data.json();
}).then((jsonData)=>{
    let subject_names = Object.keys(jsonData);
    // Create subject elements in user's viewport.
    subject_names.forEach((subject_name)=>{
        let date = jsonData[subject_name]["subject_date"];
        let description = jsonData[subject_name]["subject_description"];
        // let preview = Object.keys(data["category_name"]).slice(0, 3);
        let counter = jsonData[subject_name]["subject_process"];
        createSubjectComponent(subject_name, date, description, "nah", counter);
        return;
    });
});

let itemContainer = document.getElementById("item-container");
itemContainer.addEventListener("submit", (e)=>{
    e.preventDefault();
    let target = e.submitter.parentElement;
    let subjectName = target.getAttribute("title");
    window.location = `/contents/${userId}/${subjectName}`;
});

