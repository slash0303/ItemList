import { SubjectItemComponent, createSubjectComponent } from "./subjectItemComponent.js";

function getCookie(name) {
    let matches = document.cookie.match(new RegExp(
      "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

let userId = getCookie("userID");

fetch(`/data/subject/${userId}`).then((data)=>{
        return data.json();
    }).then((jsonData)=>{
        let subject_names = Object.keys(jsonData);
        subject_names.forEach((subject_name)=>{
            let date = jsonData["subject_date"];
            let description = jsonData["subject_description"];
            // let preview = Object.keys(data["category_name"]).slice(0, 3);
            let counter = jsonData["subject_process"];
            createSubjectComponent(subject_name, date, description, "nah", counter);
            return;
        });
});

let itemContainer = document.getElementById("item-container");
itemContainer.addEventListener("submit", (e)=>{
    e.preventDefault();
    // Get clicked target element.
    let target = e.target;
    // title 가진 요소를 target으로 설정해야함 근데 안 돼 설명 누르면 title이 없잖아 제목도 그렇고 하 제발 쉽게 좀 살자
    let subjectName = target.getAttribute("title");
    fetch(`/data/${subjectName}`);
});