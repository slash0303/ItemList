class ItemComponent extends HTMLElement{
  constructor(){
    super();
  }

  connectedCallback(){
    // create form container. form container includes 'checkbox button', 'item name', 'menu button'
    let formContainer = document.createElement("form");
    formContainer.setAttribute("class", "form-container");
    formContainer.setAttribute("method", "POST");
    formContainer.setAttribute("charset", "utf-8")
    const id = this.getAttribute("id");
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

    // create checkbox
    checkbox.setAttribute("name", "title");
    checkbox.setAttribute("value", this.getAttribute("title"));
    let checkImg = document.createElement("img");
    checkImg.setAttribute("src", "../static/res/checkIcon.svg");
    checkbox.appendChild(checkImg);
    checkbox.addEventListener("click", (e)=>{this.changeCheckMode(e)});

    /*
    checkbox에 각각 event listener를 등록할게 아니라 
    container(form으로 바꾸기)에 event listener를 주고 
    그 eventlistener가 이벤트 객체를 받아서 .target으로 정보를 가져온 다음
    해당 target의 정보만 포함하여 form요청을 보내도록 설계하기
    */

    // create element which indicates 'title'
    this.title = this.getAttribute("title");
    let checkboxId = "checkId"
    checkbox.setAttribute("id", checkboxId);
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
    
    let menuButtonImg = document.createElement("img");
    menuButtonImg.setAttribute("src", "../static/res/menuIcon.svg");
    menuButton.appendChild(menuButtonImg);
    menuButton.setAttribute("type", "button");
    menuButton.addEventListener("click", (e) => {this.itemMenuPopup(e)});

    formContainer.appendChild(menuButton);
    this.appendChild(formContainer);
    this.class = "item-content-container";
  }

  itemMenuPopup() {
    let menuContent = document.getElementById("menu-content");
    menuContent.innerHTML = this.getAttribute("title");
    dialogHandler("menu", "open");
  }

  changeCheckMode(e){
    let checkboxMode = e.srcElement.getAttribute("class");
    switch(checkboxMode){
      case "item-content-checkbox-checked":
        e.srcElement.setAttribute("class", "item-content-checkbox");
        break;
      case "item-content-checkbox":
        e.srcElement.setAttribute("class", "item-content-checkbox-checked");
        break;
      default:
        new Error("change checkbox error: checkbox mode is invaild");
    }
  }
}
customElements.define("item-component", ItemComponent);

// define class about 'category component'(aka. item container)
class CategoryComponent extends HTMLElement{
  constructor(){
    super();
  }

  connectedCallback(){
    let categoryTitle = document.createElement("strong");
    categoryTitle.setAttribute("class", "category-title");
    categoryTitle.innerHTML = this.getAttribute("title");
    this.appendChild(categoryTitle);
  }
}
customElements.define("category-component", CategoryComponent);

// get data of item list from server
async function fetchData(){
  const jsonData = fetch("/data").then((data) => {
    return data.json();
  });
  return jsonData;
}

// render items which included by category in category container
async function renderItems(jsonData){
  // create identifier to solve conflict.
  let idNum = 0;
  // find category container(target) in raw document.
  let categoryContainer = document.getElementById("category-container");
  // get keys of categories.
  categoryKeys = await Object.keys(jsonData);
  // loop with keys to generate objects about items.
  categoryKeys.forEach((categoryKey) => {
    let categoryComponent = document.createElement("category-component");
    categoryComponent.setAttribute("title", categoryKey);
    categoryContainer.appendChild(categoryComponent);
    
    let itemData = jsonData[categoryKey];
    let itemKeys = Object.keys(itemData);
    // create item which includes 'title', 'checkbox', 'menu button'
    itemKeys.forEach((itemKey) => {
      let ItemComponent = document.createElement("item-component");
      ItemComponent.setAttribute("title", itemKey);
      ItemComponent.setAttribute("category", categoryKey);
      ItemComponent.setAttribute("id", idNum);
      idNum++;
      ItemComponent.setAttribute("state", itemData[itemKey]["checked"]);
      categoryComponent.appendChild(ItemComponent);
    });
  });
}
// execute function about render.
fetchData().then((data)=>{console.log(data);
  renderItems(data)})
  .then(()=>{
    document.querySelectorAll(".form-container").forEach((formContainer)=>{
      formContainer.addEventListener("submit", (e)=>{
        // remove default feature because it occurs flickering.
        e.preventDefault();
        // send new POST request in JS
        // find HTML element about submit button(checkbox) of item.
        let submitButton = formContainer.querySelector("button[type=submit]");
        // create body of HTTP request (You should give parameters to instance of 'FormData')
        let form = new FormData(formContainer, submitButton);
        fetch("/data",
          {
            method: "POST",
            body: form
          }
        );
        console.log(form);
        console.log(formContainer);
      });
    });
  });

// change state of dialog (open or close)
function dialogHandler(type, mode){
  let targetDialog = undefined;
  switch(type){
    case "add":
      targetDialog = document.getElementById("add-dialog-fade");
      break;
    case "menu":
      targetDialog = document.getElementById("menu-dialog-fade");
      break;
    default:
      new Error("target error: type(name) of dialog is wrong.");
      break;
  }
  switch(mode){
    case "open":
      targetDialog.style.display = "block";
      break;
    case "close":
      targetDialog.style.display = "none";
      break;
    default:
      new Error("mode error");
      break;
  }
}

// function of attaching 'stopPropagation()'. this function can stop background's event.
function attachStopPropagForDialog(id){
  const dialogContainer = document.getElementById(id);
  dialogContainer.addEventListener("click", (e)=>{
    e.stopPropagation();
  });
}

// attach stopPropagation
const addDialogId = "add-dialog-bg";
attachStopPropagForDialog(addDialogId);