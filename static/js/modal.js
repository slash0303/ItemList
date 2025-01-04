class ViewState{
    constructor(){
        this.dialogIdFrame = "-dialog-fade";
        this.dialogList = ["add", "menu", "modify"];
        this.dialogIsOpen = false;
        this.currentDialog = "closed";
    }
    updateDialogState(){
        this.dialogIsOpen = false;
        this.dialogList.forEach((dialogItem)=>{
        if(document.getElementById(dialogItem + this.dialogIdFrame).style.display == "block"){
            this.dialogIsOpen = true;
            this.currentDialog = dialogItem;
            return 1;
        }
        });
        if (this.dialogIsOpen == false){
        this.currentDialog = "closed";
        }
    }
}

let viewState = window.viewState;

/** Description: change state of dialog (open or close) */
function dialogHandler(type, mode){
  const dialogIdFrame = "-dialog-fade";
  let targetDialog = document.getElementById(type+dialogIdFrame);
  switch(mode){
    case "open":
      targetDialog.style.display = "block";
      targetDialog.style.top = `${window.scrollY}px`;
      // focus on category input area.
      if(type == "add"){
        document.getElementById("add-dialog-input-category").focus();
      }
      else if(type == "modify"){
        modifyPopup();
      }
      break;

    case "close":
      targetDialog.style.display = "none";
      break;

    default:
      new Error("mode error");
      break;
  }

  /** TODO: modal.js:51 Uncaught TypeError: Cannot read properties of undefined (reading 'updateDialogState')
            at dialogHandler (modal.js:51:13)
            at HTMLButtonElement.onclick ((index):18:81)
            고쳐라 ㅅㄱ */
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

/** Description: function for modal about modify */
function modifyPopup(){
    let modifyContent = document.getElementById("modify-content");
    modifyContent.innerHTML = focusedElement.title;
}

/** Description: function of attaching 'stopPropagation()'.
  * This function can stop background's event. */
function attachStopPropagForDialog(id){
    const dialogContainer = document.getElementById(id);
    dialogContainer.addEventListener("click", (e)=>{
        e.stopPropagation();
    });
}

export { ViewState, dialogHandler, modifyPopup, attachStopPropagForDialog }