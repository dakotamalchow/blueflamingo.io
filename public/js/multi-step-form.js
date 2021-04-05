let currentTab = 0;
const tabs = document.querySelectorAll(".tab");
const pills = document.querySelectorAll(".badge.badge-pill");
const prevButton = document.querySelector("#prevButton");
const nextButton = document.querySelector("#nextButton");
const nextButtonSpan = document.querySelector("#nextButton span");
const submitButton = document.querySelector("#submitButton");
// error span is used in register-validation.js as well
const errorSpan = document.querySelector("#errorMessage");

const showTab = function(currentTab){
    pills.forEach((pill,i)=>{
        if(i<=currentTab){
            pill.classList.add("badge-primary");
            pill.classList.remove("badge-secondary");
        }
        else{
            pill.classList.add("badge-secondary");
            pill.classList.remove("badge-primary");
        };
    });
    if(currentTab==0){
        prevButton.setAttribute("hidden",true);
    }
    else{
        prevButton.removeAttribute("hidden");
    };
    if(currentTab==(tabs.length-1)){
        nextButton.setAttribute("hidden",true);
        submitButton.removeAttribute("hidden");
        populateSummary();
    }
    else{
        nextButton.removeAttribute("hidden");
        submitButton.setAttribute("hidden",true);
    };
    for(let tab of tabs){
        tab.setAttribute("hidden",true);
    };
    tabs[currentTab].removeAttribute("hidden");
};

const populateSummary = function(){
    document.querySelector("#sum-dob").innerText = document.querySelector("#dob").value;
    document.querySelector("#sum-title").innerText = document.querySelector("#title").value;
    document.querySelector("#sum-phoneNumber").innerText = document.querySelector("#phoneNumber").value;
    const address = document.querySelector("#sum-address")
    address.innerHTML = `${document.querySelector("#address").value}`;
    if(document.querySelector("#address2").value){
        address.innerHTML += `<br>${document.querySelector("#address2").value}`;
    };
    address.innerHTML += `<br>${document.querySelector("#city").value}, ${document.querySelector("#state").value} ${document.querySelector("#postalCode").value}`;
    let businessType = document.querySelector("#businessType").value;
    businessType = businessType.charAt(0).toUpperCase()+businessType.slice(1);
    document.querySelector("#sum-businessType").innerText = businessType;
    document.querySelector("#sum-category").innerText = document.querySelector("#category").value;
    document.querySelector("#sum-description").innerText = document.querySelector("#description").value;
    //include taxId, ownerFirstName, ownerLastName, and ownerEmail if businessType == "Company"
    document.querySelector("#sum-bankAccount").innerText = document.querySelector("#bankAccount").value;
    document.querySelector("#sum-bankRouting").innerText = document.querySelector("#bankRouting").value;
};

const validateFields = function(){
    let isError = false;
    let emptyFields = false;
    const labels = tabs[currentTab].getElementsByTagName("label");
        const inputs = [];
        for (let i=0; i<labels.length; i++){
            if(labels[i].htmlFor!=""){
                const input = document.getElementById(labels[i].htmlFor);
                if(input){
                    input.label = labels[i];
                };
                inputs[i] = input;
            };
        };
        for(let i=0; i<inputs.length; i++){
            if(inputs[i].required&&inputs[i].value==""){
                errorSpan.innerHTML += `<li>${inputs[i].label.innerText}</li>`;
                emptyFields = true;
            };
        };
        if(emptyFields){
            errorSpan.innerHTML = "The following fields are required:" + errorSpan.innerHTML;
            isError = true;
        };
        if(currentTab==0){
            const dob = document.querySelector("#dob").value;
            let parsedDob = Date.parse(dob);
            let date13 = new Date();
            date13.setFullYear(date13.getFullYear()-13);
            if(date13<parsedDob){
                errorSpan.innerHTML += "User must be at least 13 years old.<br>";
                isError = true;
            };
            const ssn = document.querySelector("#ssn").value;
            if(ssn&&!/^\d{3}-\d{2}-\d{4}$/.test(ssn)){
                errorSpan.innerHTML += "SSN must be in the format 123-45-6789.<br>";
                isError = true;
            };
        }
        else if(currentTab==1){
            const phoneNumber = document.querySelector("#phoneNumber").value;
            if(phoneNumber&&!/\d{3}-\d{3}-\d{4}$/.test(phoneNumber)){
                errorSpan.innerHTML += "Phone Number must be in the format 123-456-7890.<br>";
                isError = true;
            };
        }
        else if(currentTab==2){
            const description = document.querySelector("#description").value;
            if(description&&description.length<10){
                errorSpan.innerHTML += "Business Description needs to be longer (at least 10 characters).<br>";
                isError = true;
            };
        }
        else if(currentTab==3){
            const bankAccount = document.querySelector("#bankAccount").value;
            const confirmBankAccount = document.querySelector("#confirmBankAccount").value;
            const bankRouting = document.querySelector("#bankRouting").value;
            if(bankAccount&&confirmBankAccount&&(bankAccount!=confirmBankAccount)){
                errorSpan.innerHTML += "Bank Account numbers must match.<br>";
                isError = true;
            };
            if(bankRouting&&bankRouting.length!=9){
                errorSpan.innerHTML += "Bank Routing number must be 9 digits long.<br>";
                isError = true;
            };
        };
        if(isError){
            errorSpan.removeAttribute("hidden");
        };
        return isError;
};

const prevTab = function(){
    errorSpan.innerHTML = "";
    errorSpan.setAttribute("hidden",true);
    if(currentTab>0){
        currentTab-=1;
        showTab(currentTab);
    };
};

const nextTab = function(){
    errorSpan.innerHTML = "";
    errorSpan.setAttribute("hidden",true);
    if(currentTab<tabs.length-1){
        const isError = validateFields();
        if(!isError){
            currentTab+=1;
            showTab(currentTab);
        };
    };
};

showTab(currentTab);
prevButton.addEventListener("click",prevTab);
nextButton.addEventListener("click",nextTab);