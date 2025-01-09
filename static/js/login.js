let urlSearch = new URLSearchParams(location.search);

let selectedMode = urlSearch.get("selected");

let signupForm = document.getElementById("signup-form");
let signinForm = document.getElementById("signin-form");

const hideElement = (element) => {
    element.style.display = "none";
}

if(selectedMode == "signup"){
    hideElement(signinForm);
}
else if(selectedMode == "signin"){
    hideElement(signupForm);
}
else{
    hideElement(signupForm);
    hideElement(signinForm);
}