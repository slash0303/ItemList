import { SubjectItemComponent } from "../subjects_page/subjectItemComponent.js";

/** Description: track user's viewport. ViewState will track the state of modal. */
class ViewState {
    constructor() {
        this.dialogIdFrame = "-dialog-fade";
        this.dialogList = ["add", "menu", "modify"];
        this.dialogIsOpen = false;
        this.currentDialog = "closed";
    }
    updateDialogState() {
        // Set default state
        this.dialogIsOpen = false;
        // search all of dialog and evaluate about activation.
        this.dialogList.forEach((dialogItem) => {
            if (document.getElementById(dialogItem + this.dialogIdFrame).style.display == "block") {
                this.dialogIsOpen = true;
                this.currentDialog = dialogItem;
                return;
            }
        });
        // if the states about all of dialogs are closed, set 'currentDialog' propety to 'closed'.
        if (this.dialogIsOpen == false) {
            this.currentDialog = "closed";
        }
    }
}

/** Description: change state of dialog (open or close) */
function dialogHandler(type, mode) {
    const dialogIdFrame = "-dialog-fade";
    let targetDialog = document.getElementById(type + dialogIdFrame);
    switch (mode) {
        case "open":
            targetDialog.style.display = "block";
            targetDialog.style.top = `${window.scrollY}px`;
            // focus on category input area.
            if (type == "add") {
                document.getElementById("add-dialog-input-subject").focus();
            }
            else if (type == "modify") {
                setModifyDialog();
                document.getElementById("modify-dialog-input-category").focus();
            }
            break;
        case "close":
            targetDialog.style.display = "none";
            break;

        default:
            new Error("mode error");
            break;
    }

    // update viewState
    window.viewState.updateDialogState();

    // control scroll prevention
    if (window.viewState.dialogIsOpen) {
        // activate scroll prevention
        document.querySelector("body").style.overflow = "hidden";
    }
    else {
        // deactivate scroll prevention
        document.querySelector("body").style.overflow = "visible";
    }
}

/** Description: Setting modify dialog before the user uses it. */
function setModifyDialog() {
    // Close menu dialog.
    dialogHandler("menu", "close");
    const currentHref = window.location.href;
    let currentPage = currentHref.split("/")
    currentPage = currentPage[currentPage.length - 2];
    if (currentPage == "subjects"){
        // find data fields from the form of modify dialog.
        let moddedName = document.getElementById("modify-dialog-input-name");
        let moddedDescription = document.getElementById("modify-dialog-input-description");
        let originalName = document.getElementById("modify-dialog-original-name");

        // Set teh data in the fields.
        originalName.value = moddedName.placeholder = window.focusedElement.title;
        moddedDescription.placeholder = window.focusedElement.description;
    }
    else{
        // find data fields from the form of modify dialog.
        let moddedCategory = document.getElementById("modify-dialog-input-category");
        let moddedItem = document.getElementById("modify-dialog-input-item");
        let originalCategory = document.getElementById("modify-dialog-original-category");
        let originalItem = document.getElementById("modify-dialog-original-item");

        // set the data into the fields.
        originalCategory.value = moddedCategory.placeholder = window.focusedElement.category;
        originalItem.value = moddedItem.placeholder = window.focusedElement.title;
    }
}


/** Description: function for attaching 'stopPropagation()'.
  * This function find the element from ID and stop background's event.
  */
function attachStopPropagWithId(id) {
    const dialogContainer = document.getElementById(id);
    dialogContainer.addEventListener("click", (e) => {
        e.stopPropagation();
    });
}
/** Description: function for attaching 'stopPropagation()' to elements
 * This function find the elements from class and stop all of their background's event.
 */
function attachStopPropagWithClassAll(className) {
    const dialogContainers = document.querySelectorAll(`.${className}`);
    dialogContainers.forEach((dialogContainer) => {
        dialogContainer.addEventListener("click", (e) => {
            e.stopPropagation();
        });
    });
}


export { ViewState, dialogHandler, setModifyDialog, attachStopPropagWithId, attachStopPropagWithClassAll }