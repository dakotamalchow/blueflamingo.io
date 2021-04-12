const categoryInput = document.querySelector("#category");
const mccInput = document.querySelector("#mcc");
let categoryIndex;

const selectCategory = function(){
    categoryInput.value = this.description;
    mccInput.value = this.mcc;
    categoryIndex = this.index;
};

const updateDropdown = function(){
    const searchResultUl = document.querySelector("#searchResults");
    while(searchResultUl.firstChild){
        searchResultUl.removeChild(searchResultUl.firstChild);
    };
    const input = this.value.toLowerCase();
    //categories is passed as a variable in the view
    for(let i=0; i<categories.length; i++){
        if(categories[i].description.toLowerCase().includes(input)||input==""){
            const buttonDiv = document.createElement("div");
            buttonDiv.classList.add("btn","btn-block","btn-outline-light","text-dark","border","m-0");
            buttonDiv.description = categories[i].description;
            buttonDiv.mcc = categories[i].mcc;
            buttonDiv.index = i;
            buttonDiv.addEventListener("click",selectCategory);

            const categoryLi = document.createElement("li");
            categoryLi.setAttribute("role","menuitem");
            categoryLi.innerText = categories[i].description;

            buttonDiv.append(categoryLi);
            searchResultUl.append(buttonDiv);
        };
    };
};

const validateCategory = function(){
    if((!categories[categoryIndex])||(categories[categoryIndex].description!=this.value)){
        this.value = "";
        mccInput.value = "";
    };
};

categoryInput.addEventListener("keydown",updateDropdown);
categoryInput.addEventListener("click",updateDropdown);
categoryInput.addEventListener("change",validateCategory);