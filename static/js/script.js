class FocusedElement{
  constructor(){
    // find 'category-container' and attach eventlistener about 'changeFocus'.
    this.categoryContainer = document.getElementById("category-container");
    this.categoryContainer.addEventListener("click", (e)=>{this.changeFocus(e)});
  }

  changeFocus(event){
    console.log(event);
    this.element = event.srcElement.parentElement.parentElement;
    this.title = this.element.getAttribute("title");
    this.category = this.element.getAttribute("category");
  }
}
// focused system: track the element which pressed by user.
let focusedElement = new FocusedElement();



class ViewState{
  constructor(){
    this.dialogIdFrame = "-dialog-fade";
    this.dialogList = ["add", "menu", "modify"];
    this.dialogIsOpen = false;
  }
  updateDialogState(){
    this.dialogIsOpen = false;
    this.dialogList.forEach((dialogItem)=>{
      if(document.getElementById(dialogItem + this.dialogIdFrame).style.display == "block"){
        this.dialogIsOpen = true;
        return 0;
      }
    });
    console.log(this.dialogIsOpen);
  }
}
let viewState = new ViewState();



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

  itemMenuPopup() {
    let menuContent = document.getElementById("menu-content");
    menuContent.innerHTML = this.getAttribute("title");
    menuContent.setAttribute("title", this.getAttribute("title"));
    menuContent.setAttribute("category", this.getAttribute("category"));
    dialogHandler("menu", "open");
  }  
}
customElements.define("item-component", ItemComponent);



// the function to change mode of checkbox.
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
  // create identifier to prevent conflict.
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
    // create item component which includes 'title', 'checkbox', 'menu button'
    itemKeys.forEach((itemKey) => {
      let ItemComponent = document.createElement("item-component");
      ItemComponent.setAttribute("title", itemKey);
      ItemComponent.setAttribute("category", categoryKey);
      ItemComponent.setAttribute("idnum", idNum);
      ItemComponent.setAttribute("id", `itemComponent-${idNum}`);
      idNum++;
      ItemComponent.setAttribute("state", itemData[itemKey]["checked"]);
      categoryComponent.appendChild(ItemComponent);
    });
  });
}
// execute function about render.
fetchData().then((data)=>{
  renderItems(data)})
  .then(()=>{
    let categoryContainer = document.getElementById("category-container");
    categoryContainer.addEventListener("submit", (e)=>{
      // remove submit feature to remove flickering caused by refresh.
      e.preventDefault();
      // get information about target which clicked directly and find container of item which contain id number of the target.
      let target = e.submitter;
      // call the function to change color of the checkbox(target).
      changeCheckboxMode(target);
      let targetId = target.id.split("-");
      let targetIdNum = targetId[1];
      // get element about component of item.
      console.log(`itemComponent-${targetIdNum}`);
      let itemComponent = document.getElementById(`itemComponent-${targetIdNum}`);
      // extract data from item component to create body of POST request.
      let formBody = new FormData();
      formBody.append("category", itemComponent.getAttribute("category"));
      formBody.append("title", itemComponent.getAttribute("title"));
      formBody.append("state", itemComponent.getAttribute("state"));
      // send POST request.
      fetch("/data", 
        {
          method: "POST",
          body: formBody
        }
      )
    });
  });



// change state of dialog (open or close)
function dialogHandler(type, mode){
  const dialogIdFrame = "-dialog-fade";
  let targetDialog = document.getElementById(type+dialogIdFrame);
  
  switch(mode){
    case "open":
      targetDialog.style.display = "block";
      targetDialog.style.top = window.scrollY;
      console.log(window.scrollY);
      // focus on category input area.
      if(type == "add"){
        document.getElementById("add-dialog-input-category").focus();
      }
      break;

    case "close":
      targetDialog.style.display = "none";
      break;

    default:
      new Error("mode error");
      break;
  }

  viewState.updateDialogState();
  if(viewState.dialogIsOpen){
    // activate scroll prevention
    document.querySelector("body").style.overflow = "hidden";
  }
  else{
    // deactivate scroll prevention
    document.querySelector("body").style.overflow = "visible";
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
const addDialogApplyButtonId = "apply-button";
attachStopPropagForDialog(addDialogApplyButtonId);


/** send 'item remove' request to server. */
function removeItem(id){
  // fetch request
  let formKeys = ["category", "title"];
  let dataElement = document.getElementById(id);
  let formBody = createFormBody(formKeys, dataElement);
  fetch("/remove",
    {
      method: "POST",
      body: formBody
    }
  );
  // remove item in client's viewport.
  // get list about all of item components.
  // if the number of child of category becomes 2, delete the category instead of item.
  // theshold value is 2 because it has a title as a default.
  if(focusedElement.element.parentElement.childElementCount == 2){
    focusedElement.element.parentElement.remove();
  }
  else{
    focusedElement.element.remove();
  }
}



/** Create form body for POST request. */
function createFormBody(keys, targetComponent){
  let formBody = new FormData;
  console.log(targetComponent);
  keys.forEach(key => {
    formBody.append(key, targetComponent.getAttribute(key));
  });
  return formBody;
}



/** Shortcut key event */
document.addEventListener("keydown", (e)=>{
  if(e.key == 'a' && e.ctrlKey && viewState.dialogIsOpen){
    e.preventDefault();
    dialogHandler("add", "open");
  }
});