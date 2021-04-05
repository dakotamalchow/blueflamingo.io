const phoneNumberInput = document.querySelector("#phoneNumber");
const ssnInput = document.querySelector("#ssn");
const companyInfoDiv = document.querySelector("#companyInfo");
const businessTypeSelect = document.querySelector("#businessType");
// currentTab and errorSpan are defined in multi-step-form.js

const formatSSN = function(){
    let unformattedSSN = this.value.replace(/\D/g,"");
    let formattedSSN = unformattedSSN.substring(0,3);
    if(unformattedSSN.length>3){
        formattedSSN += "-"+unformattedSSN.substring(3,5);
    };
    if(unformattedSSN.length>6){
        formattedSSN += "-"+unformattedSSN.substring(5,9);
    };
    this.value = formattedSSN;
};

ssnInput.addEventListener("change",formatSSN);

const formatPhoneNumber= function(){
    let unformattedNumber = this.value.replace(/\D/g,"");
    let formattedNumber = unformattedNumber.substring(0,3);
    if(unformattedNumber.length>3){
        formattedNumber += "-"+unformattedNumber.substring(3,6);
    };
    if(unformattedNumber.length>6){
        formattedNumber += "-"+unformattedNumber.substring(6,10);
    };
    this.value = formattedNumber;
};

phoneNumberInput.addEventListener("change",formatPhoneNumber);

const showCompanyInfo = function(){
    errorSpan.innerHTML = "";
    errorSpan.setAttribute("hidden",true);
    const companyInputs = companyInfoDiv.getElementsByTagName("input");
    if(this.value=="company"){
        companyInfoDiv.removeAttribute("hidden");
        for(let input of companyInputs){
            input.setAttribute("required",true);
        };
    }
    else{
        companyInfoDiv.setAttribute("hidden",true);
        for(let input of companyInputs){
            input.removeAttribute("required");
        };
    };
};

businessTypeSelect.addEventListener("change",showCompanyInfo);