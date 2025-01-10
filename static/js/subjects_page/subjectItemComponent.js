class SubjectItemComponent extends HTMLElement{
    constructor(){
        super();
    }

    connectedCallback(){
        let subjectContainer = document.createElement("div");
        subjectContainer.setAttribute("class", "subject-container");

        // Create container of title line.
        let titleLineContainer = document.createElement("div");
        titleLineContainer.setAttribute("class", "title-line-container");
        
        // Create container of title and logo.
        let titleContainer = document.createElement("div");
        titleContainer.setAttribute("class", "title-container");

        // Create title text element.
        let subjectTitleText = document.createElement("div");
        subjectTitleText.setAttribute("class", "subject-title-text");
        let titleText = this.getAttribute("title");
        subjectTitleText.innerHTML = titleText;
        titleContainer.appendChild(subjectTitleText);

        // Create date text element.
        let subjectDateText = document.createElement("div");
        subjectDateText.setAttribute("class", "subject-date-text");
        let dateText = this.getAttribute("date");
        subjectDateText.innerHTML = dateText;
        titleContainer.appendChild(subjectDateText);

        titleLineContainer.appendChild(titleContainer);

        // Create subject menu button element.
        let subjectMenuButton = document.createElement("button");
        subjectMenuButton.setAttribute("class", "subject-menu-button");

        // Create menu button img element.
        let subjectMenubuttonImg = document.createElement("img");
        subjectMenubuttonImg.setAttribute("class", "subject-menu-button-img");
        subjectMenubuttonImg.setAttribute("src", "../static/res/menuIcon.png");
        subjectMenuButton.appendChild(subjectMenubuttonImg);

        titleLineContainer.appendChild(subjectMenuButton);
        subjectContainer.appendChild(titleLineContainer);

        // Create description text element.
        let subjectDescriptionText = document.createElement("div");
        subjectDescriptionText.setAttribute("class", "subject-description-text");
        let descriptionText = this.getAttribute("description");
        subjectDescriptionText.innerHTML = descriptionText;
        subjectContainer.appendChild(subjectDescriptionText);

        // Create divide line element.
        let subjectDivideLine = document.createElement("hr");
        subjectDivideLine.setAttribute("class", "subject-divide-line");
        subjectContainer.appendChild(subjectDivideLine);

        // Create container of bottom area.
        let bottomLineContainer = document.createElement("div");
        bottomLineContainer.setAttribute("class", "bottom-line-container");
        
        // Create subject preview text element which include content's name of item.
        let itemPreviewText = document.createElement("div");
        itemPreviewText.setAttribute("class", "itemPreviewText");
        let previewText = this.getAttribute("preview");
        itemPreviewText.innerHTML = previewText;
        bottomLineContainer.appendChild(itemPreviewText);

        // Create process counter text.
        let processCounterText = document.createElement("div");
        processCounterText.setAttribute("class", "process-counter-text");
        let counterText = this.getAttribute("counter");
        processCounterText.innerHTML = counterText;
        bottomLineContainer.appendChild(processCounterText);

        subjectContainer.appendChild(bottomLineContainer);
        this.appendChild(subjectContainer);
    }
}

customElements.define("subject-item-component", SubjectItemComponent);

/** Description: Create subject component in item container. */
function createSubjectComponent(title, date, description, preview, counter){
    let itemContainer = document.getElementById("item-container");
    let subjectComponent = document.createElement("subject-item-component");
    subjectComponent.setAttribute("title", title);
    subjectComponent.setAttribute("date", date);
    subjectComponent.setAttribute("description", description);
    subjectComponent.setAttribute("preview", preview);
    subjectComponent.setAttribute("counter", counter);
    itemContainer.appendChild(subjectComponent);
}

export { SubjectItemComponent, createSubjectComponent }