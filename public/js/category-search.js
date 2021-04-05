const categoryInput = document.querySelector("#category");
const mccInput = document.querySelector("#mcc");

const selectCategory = function(){
    categoryInput.value = this.description;
    mccInput.value = this.mcc;
};

const updateDropdown = function(){
    const searchResultUl = document.querySelector("#searchResults");
    while(searchResultUl.firstChild){
        searchResultUl.removeChild(searchResultUl.firstChild);
    };
    const input = this.value.toLowerCase();
    //categories is passed as a variable in the view
    for(let category of categories){
        if(category.description.toLowerCase().includes(input)||input==""){
            const buttonDiv = document.createElement("div");
            buttonDiv.classList.add("btn","btn-block","btn-outline-light","text-dark","border","m-0");
            buttonDiv.description = category.description;
            buttonDiv.mcc = category.mcc;
            buttonDiv.addEventListener("click",selectCategory);

            const categoryLi = document.createElement("li");
            categoryLi.setAttribute("role","menuitem");
            categoryLi.innerText = category.description;

            buttonDiv.append(categoryLi);
            searchResultUl.append(buttonDiv);
        };
    };
};

// if a category wasn't picked, clear the field

categoryInput.addEventListener("keydown",updateDropdown);
categoryInput.addEventListener("click",updateDropdown);