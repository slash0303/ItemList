/** Description: get data of item list from server */
async function fetchData(){
    const jsonData = fetch("/data").then((data) => {
        return data.json();
    });
    return jsonData;
}

/** Description: render items which included by category in category container. */
async function renderItems(jsonData){
    // create identifier to prevent conflict.
    let idNum = 0;
    // find category container(target) in raw document.
    let categoryContainer = document.getElementById("category-container");
    // get keys of categories.
    let categoryKeys = await Object.keys(jsonData);
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

/** Description: Create form body for POST request. */
function createFormBody(keys, targetComponent){
    let formBody = new FormData;
    keys.forEach(key => {
        formBody.append(key, targetComponent.getAttribute(key));
    });
    return formBody;
}

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
    /** remove item in client's viewport.
     *  get list about all of item components.
     *  if the number of child of category becomes 2, delete the category instead of item.
     *  theshold value is 2 because it has a title as a default.
     */
    console.log(focusedElement.element.parentElement.childElementCount);
    if(focusedElement.element.parentElement.childElementCount <= 2){
        focusedElement.element.parentElement.remove();
    }
    else{
        focusedElement.element.remove();
    }
}

export { fetchData, renderItems, createFormBody, removeItem };