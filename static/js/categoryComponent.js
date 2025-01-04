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

export { CategoryComponent };