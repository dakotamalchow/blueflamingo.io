let currentTab = 0;
const tabs = document.querySelectorAll(".tab");
const pills = document.querySelectorAll(".badge.badge-pill");
const prevButton = document.querySelector("#prevButton");
const nextButton = document.querySelector("#nextButton");
const nextButtonSpan = document.querySelector("#nextButton span");
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
        nextButtonSpan.innerText = "Submit";
        nextButton.setAttribute("type","submit");
        populateSummary();
    }
    else{
        nextButtonSpan.innerText = "Next";
        nextButton.setAttribute("type","button");
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
    document.querySelector("#sum-businessType").innerText = document.querySelector("#businessType").value;
    document.querySelector("#sum-category").innerText = document.querySelector("#category").value;
    document.querySelector("#sum-description").innerText = document.querySelector("#description").value;
    document.querySelector("#sum-taxId").innerText = document.querySelector("#taxId").value;
    document.querySelector("#sum-bankAccount").innerText = document.querySelector("#bankAccount").value;
    document.querySelector("#sum-bankRouting").innerText = document.querySelector("#bankRouting").value;
};

const prevTab = function(){
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
        // const labels = tabs[currentTab].getElementsByTagName("label");
        // const inputs = tabs[currentTab].getElementsByTagName("input");
        // for(let i=0; i<inputs.length; i++){
        //     if(inputs[i].required&&inputs[i].value==""){
        //         errorSpan.innerHTML += `<li>${labels[i].innerText}</li>`;
        //         errorSpan.removeAttribute("hidden");
        //         isError = true;
        //     };
        // };
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