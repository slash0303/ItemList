import { dialogHandler } from "./modal.js";

/** Description: get data of item list from server */
async function fetchData(){
    const jsonData = fetch(`/data/contents/${window.subjectName}`).then((data) => {
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
    console.log(jsonData);
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

/** Description: Extract data from HTMLElement(targetComponenet) 
 *  and Create form body. */
function createFormBody(keys, targetComponent){
    let formBody = new FormData;
    keys.forEach(key => {
        formBody.append(key, targetComponent.getAttribute(key));
    });
    return formBody;
}

/** Description: Extract data from HTMLElement(targetComponenet) 
 *  and create query string. */
function createQueryString(baseURL, keys, targetComponent){
    let queryString = baseURL + "?";
    keys.forEach(key => {
        queryString += `${key}=${targetComponent.getAttribute(key)}&`
    });
    return queryString.slice(0, -1);
}

/** Description Send 'item remove' request to server. */
async function removeItem(id){
    // Fetch request
    let formKeys = ["category", "title"];
    let dataElement = document.getElementById(id);
    // Send DELETE request to server.
    const response = await fetch(createQueryString(`/data/contents/${window.subjectName}`, formKeys, dataElement), {method: "DELETE"});
    // If the response include the error, end the function and don't remove the item.
    if (!response.ok){
        console.log("fetch error while removing item.", response.status);
        console.log(response.ok);
        console.log(response);
        return;
    }

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

    // close modal
    dialogHandler("menu", "close");
}

export { fetchData, renderItems, createFormBody, removeItem };