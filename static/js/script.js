import { CategoryComponent } from "./categoryComponent.js";
import { FocusedElement, ItemComponent, changeCheckboxMode } from "./itemComponent.js";
import { ViewState, dialogHandler, setModifyDialog, attachStopPropagWithId, attachStopPropagWithClassAll } from "./modal.js";

import { fetchData, renderItems, removeItem } from "./renderData.js";

// Function binding for HTML button
window.dialogHandler = dialogHandler;
window.removeItem = removeItem;   

// Get subject name from location.
window.subjectName = window.location.pathname.split("/")[2]; 

// Change title of page
let titleElement = document.getElementById("item-general-title");
titleElement.innerHTML = window.subjectName;

document.title = `${window.subjectName} - item list`

// Change action route of add form.
let addFormElement = document.getElementById("add-form");
addFormElement.action = `/add/${subjectName}`;

// Track the element which clicked by user.
let focusedElement = new FocusedElement();
// Track the state of modal windows.
let viewState = new ViewState();
// Instance binding for external files.
window.focusedElement = focusedElement;
window.viewState = viewState;

// Define web-component of category-component.
customElements.define("category-component", CategoryComponent);
// Define web-component of item-component.
customElements.define("item-component", ItemComponent);


// execute function about rendering items.
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
      let itemComponent = document.getElementById(`itemComponent-${targetIdNum}`);
      // extract data from item component to create body of POST request.
      let formBody = new FormData();
      formBody.append("category", itemComponent.getAttribute("category"));
      formBody.append("title", itemComponent.getAttribute("title"));
      formBody.append("state", itemComponent.getAttribute("state"));
      // send POST request.
      fetch(`/data/${window.subjectName}`, 
        {
          method: "POST",
          body: formBody
        }
      );
    });
  });


// attach stopPropagation
const addDialog_Id = "add-dialog-bg";
attachStopPropagWithId(addDialog_Id);
const addDialogApplyButton_Id = "add-apply-button";
attachStopPropagWithId(addDialogApplyButton_Id);
const modifyDialog_Id = "modify-dialog-bg";
attachStopPropagWithId(modifyDialog_Id);
const modifyDialogApplyButton_Id = "modify-apply-button";
attachStopPropagWithId(modifyDialogApplyButton_Id);
const dialogContainer_ClassName = "dialog-content-container";
attachStopPropagWithClassAll(dialogContainer_ClassName);


/** Shortcut key event */
document.addEventListener("keydown", (e)=>{
  if(e.key == 'a' && e.ctrlKey && !window.viewState.dialogIsOpen){
    e.preventDefault();
    dialogHandler("add", "open");
  }
  if(e.key == "Escape" && window.viewState.dialogIsOpen){
    e.preventDefault();
    dialogHandler(viewState.currentDialog, "close");
  }
});

/** cancel submit because HTML form cannot send PATCH method */
let modifyDialogContainer = document.getElementById("modify-dialog-container");
modifyDialogContainer.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  let moddedCategory = document.getElementById("modify-dialog-input-category")
  let moddedItem = document.getElementById("modify-dialog-input-item")
  let originalCategory = document.getElementById("modify-dialog-original-category")
  let originalItem = document.getElementById("modify-dialog-original-item")

  let formBody = new FormData();
  formBody.append("modded_item", moddedItem.value);
  formBody.append("modded_category", moddedCategory.value);
  formBody.append("original_item", originalItem.value);
  formBody.append("original_category", originalCategory.value);

  const response = await fetch(`/data/${window.subjectName}`, 
    {
      method: "PATCH",
      body: formBody
    }
  );

  if(response.ok){
    location.reload();
  }
  else{
    console.log(response);
  }
});