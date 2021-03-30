let currentTab = 0;
const tabs = document.querySelectorAll(".tab");
const pills = document.querySelectorAll(".badge.badge-pill");
const prevButton = document.querySelector("#prevButton");
const nextButton = document.querySelector("#nextButton");
const nextButtonSpan = document.querySelector("#nextButton span");
const submitButton = document.querySelector("#submitButton");
const errorSpan = document.querySelector("#errorMessage");

const companyInfoDiv = document.querySelector("#companyInfo");
const businessTypeSelect = document.querySelector("#businessType");

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
    let isError = false;
    if(currentTab<tabs.length-1){
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
                errorSpan.removeAttribute("hidden");
                isError = true;
            };
        };
        if(isError){
            errorSpan.innerHTML = "The following field(s) are required:" + errorSpan.innerHTML;
        }
        else{
            currentTab+=1;
            showTab(currentTab);
        };
    };
};

showTab(currentTab);
prevButton.addEventListener("click",prevTab);
nextButton.addEventListener("click",nextTab);