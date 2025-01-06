// focused system: track the element which pressed by user.
class FocusedElement{
    constructor(){
        // find 'category-container' and attach eventlistener about 'changeFocus'.
        this.categoryContainer = document.getElementById("category-container");
        this.categoryContainer.addEventListener("click", (e)=>{this.changeFocus(e)});
    }

    changeFocus(event){
        this.element = event.srcElement;
        while(this.element.nodeName != "ITEM-COMPONENT"){
            this.element = this.element.parentElement;
        }
        this.title = this.element.getAttribute("title");
        this.category = this.element.getAttribute("category");
    }
}

// Web-component class of item component
class ItemComponent extends HTMLElement{
    constructor(){
        super();
    }

    connectedCallback(){
        // create form container. form container includes 'checkbox button', 'item name', 'menu button'
        let formContainer = document.createElement("div");
        formContainer.setAttribute("class", "form-container");
        formContainer.setAttribute("method", "POST");
        formContainer.setAttribute("charset", "utf-8");
        const idNum = this.getAttribute("idnum");
        formContainer.setAttribute("action", "/data");

        // create button which one act as checkbox
        let checkbox = document.createElement("button");
        checkbox.setAttribute("type", "submit");
        switch(this.getAttribute("state")){
        case "true":
            checkbox.setAttribute("class", "item-content-checkbox-checked");
            break;
        case "false":
            checkbox.setAttribute("class", "item-content-checkbox");
            break;
        default:
            new Error("an error occured while in checkbox generating");
        }
        checkbox.setAttribute("name", "title");
        checkbox.setAttribute("value", this.getAttribute("title"));
        checkbox.setAttribute("id", `checkbox-${idNum}`);
        let checkImg = document.createElement("img");
        checkImg.setAttribute("src", "../static/res/checkIcon.svg");
        checkImg.setAttribute("id", `checkImg-${idNum}`);
        checkbox.appendChild(checkImg);

        /*
        checkbox에 각각 event listener를 등록할게 아니라 
        container(form으로 바꾸기)에 event listener를 주고 (event propagation 이용)
        그 eventlistener가 이벤트 객체를 받아서 .target으로 정보를 가져온 다음
        해당 target의 정보만 포함하여 form요청을 보내도록 설계하기

        >> 성공!
        */

        // create element which indicates 'title'
        this.title = this.getAttribute("title");
        checkbox.setAttribute("id", `title-${idNum}`);
        formContainer.appendChild(checkbox);

        // create form content which includes data about 'category'
        let titleForForm = document.createElement("input");
        titleForForm.setAttribute("type", "hidden");
        titleForForm.setAttribute("name", "category");
        titleForForm.setAttribute("value", this.getAttribute("category"));
        formContainer.appendChild(titleForForm);

        // create title text of it.
        let title = document.createElement("strong");
        title.setAttribute("class", "item-content-title");
        title.innerText = this.getAttribute("title");
        formContainer.appendChild(title);

        // create menu button
        let menuButton = document.createElement("button");
        menuButton.setAttribute("title", this.getAttribute("title"));
        menuButton.setAttribute("class", "item-content-menu-button");
        menuButton.setAttribute("id", `button-${idNum}`);
        
        let menuButtonImg = document.createElement("img");
        menuButtonImg.setAttribute("src", "../static/res/menuIcon.svg");
        menuButton.appendChild(menuButtonImg);
        menuButton.setAttribute("type", "button");
        menuButton.addEventListener("click", (e) => {this.itemMenuPopup(e)});

        formContainer.appendChild(menuButton);
        this.appendChild(formContainer);
        this.class = "item-content-container";
    }

    /** TODO: Modify this function. Should move this out of class. */
    itemMenuPopup() {
        let menuContent = document.getElementById("menu-content");
        menuContent.innerHTML = this.getAttribute("title");
        menuContent.setAttribute("title", this.getAttribute("title"));
        menuContent.setAttribute("category", this.getAttribute("category"));
        dialogHandler("menu", "open");
    }  
}


/** Description: The function to change mode of checkbox. */
function changeCheckboxMode(checkboxButton){
    let checkboxMode = checkboxButton.getAttribute("class");
    switch(checkboxMode){
        case "item-content-checkbox-checked":
        checkboxButton.setAttribute("class", "item-content-checkbox");
        break;
        case "item-content-checkbox":
        checkboxButton.setAttribute("class", "item-content-checkbox-checked");
        break;
        default:
        new Error("change checkbox error: checkbox mode is invaild");
    }
}


export { FocusedElement, ItemComponent, changeCheckboxMode}