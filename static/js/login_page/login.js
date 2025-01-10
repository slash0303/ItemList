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

let deviceIdElements = document.querySelectorAll(".device-id");
deviceIdElements.forEach((deviceIdElement) => {
    let deviceId = `${navigator.userAgent}-${Date()}`;
    deviceIdElement.value = deviceId;
    console.log(deviceIdElement);
    console.log(deviceId);
});