const logoInput = document.querySelector("#logoInput");
const logoLabel = document.querySelector("#logoLabel");
const logoImg = document.querySelector("#logoImg");
const logoImgDiv = document.querySelector("#logoImgDiv");
const removeLogoButton = document.querySelector("#removeLogoButton");

const showLogo = (event)=>{
    logoImgDiv.removeAttribute("hidden");
    logoImg.src = URL.createObjectURL(event.target.files[0]);
    logoImg.alt = "logo";
};

const removeLogo = ()=>{
    logoImg.src = "";
    logoImg.alt = "";
    logoImgDiv.setAttribute("hidden",true);
    logoInput.value = "";
    logoLabel.innerText = "Choose file";
};

logoInput.addEventListener("change",showLogo);
removeLogoButton.addEventListener("click",removeLogo);