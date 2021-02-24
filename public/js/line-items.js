const addItemButton = document.querySelector("#add-item-button");
const removeItemButton = document.querySelector("#remove-item-button");
const lineItemsDiv = document.querySelector("#line-items");

const total = document.querySelector("#total");
total.innerText = "0.00";
let lineItemCount = 0;

const updateTotal = function(){
    this.value = parseFloat(this.value).toFixed(2);
    const lineItemAmounts = document.querySelectorAll(".line-item-amount");
    let newTotal = 0;
    for(let amount of lineItemAmounts){
        newTotal += parseFloat(amount.value);
    };
    if(!newTotal) newTotal = 0;
    total.innerText = newTotal.toFixed(2);
};

const amountInput0 = document.querySelector("#amountInput0");
amountInput0.addEventListener("change",updateTotal);

const itemsDiv = document.querySelector("#items");
const items  = JSON.parse(itemsDiv.value);

const addToLineItem = function(){
    const descriptionInput = document.querySelector(`#descriptionInput${this.i}`);
    descriptionInput.value = this.description;
    const amountInput = document.querySelector(`#amountInput${this.i}`);
    amountInput.value = this.amount.toFixed(2);
    updateTotal();
};

/*
<div class="btn btn-block btn-outline-light text-dark border m-0">
    <li class="row m-0" role="menuitem">
        <div class="col p-0 text-left"><%= item.description %></div>
        <div class="col p-0 text-right">$<%= item.amount.toFixed(2) %></div>
    </li>
</div>
*/

const updateDropdown = function(){
    const lineItemNumber = this.id.slice(-1);
    const searchResultDiv = document.querySelector(`#searchResultDiv${lineItemNumber}`);
    while(searchResultDiv.firstChild){
        searchResultDiv.removeChild(searchResultDiv.firstChild);
    };
    const input = this.value.toLowerCase();
    for(let item of items){
        if(item.description.toLowerCase().includes(input)||input==""){
            const buttonDiv = document.createElement("div");
            buttonDiv.classList.add("btn","btn-block","btn-outline-light","text-dark","border","m-0");
            buttonDiv.i = lineItemNumber;
            buttonDiv.description = item.description;
            buttonDiv.amount = item.amount;
            buttonDiv.addEventListener("click",addToLineItem);

            const menuItemLi = document.createElement("li");
            menuItemLi.classList.add("row","m-0");
            menuItemLi.setAttribute("role","menuitem");

            const descriptionDiv = document.createElement("div");
            descriptionDiv.classList.add("col","p-0","text-left");
            descriptionDiv.innerText = item.description;

            const amountDiv = document.createElement("div");
            amountDiv.classList.add("col","p-0","text-right");
            amountDiv.innerText = "$"+item.amount.toFixed(2);

            menuItemLi.append(descriptionDiv);
            menuItemLi.append(amountDiv);
            buttonDiv.append(menuItemLi);
            searchResultDiv.append(buttonDiv);
        };
    };
};

const descriptionInput0 = document.querySelector("#descriptionInput0");
descriptionInput0.addEventListener("keydown",updateDropdown);
descriptionInput0.addEventListener("click",updateDropdown);

/*
<div class="form-row ml-0 mb-2 line-item">
    <input class="form-control px-2 col-7 col-sm-8 col-md-9 col-lg-10" type="text" id="descriptionInput#" name="lineItems[item#][description]" placeholder="Description" data-toggle="dropdown" autocomplete="off" required>
    <div class="input-group col-5 col-sm-4 col-md-3 col-lg-2">
        <span class="input-group-text">$</span>
        <input class="form-control line-item-amount" type="number" id="amountInput0" name="lineItems[item#][amount]" placeholder="0.00" step="0.01" min="0" required>
    </div>
    <ul class="dropdown-menu p-0 pre-scrollable" role="menu" aria-labelledby="descriptionInput#">
        <a class="btn btn-block btn-outline-primary m-0" href="/items/new">
            <li class="text-left" role="menuitem">&plus; Create New Item</li>
        </a>
        <div id="searchResultDiv">
            <!-- search results for descriptionInput0 will be added here -->
        </div>
    </ul>
</div>
*/

const addLineItem = function(){
    lineItemCount+=1;

    const itemDiv = document.createElement("div");
    itemDiv.classList.add("form-row","ml-0","mb-2","line-item");

    const descriptionInput = document.createElement("input");
    descriptionInput.classList.add("form-control","px-2","col-7","col-sm-8","col-md-9","col-lg-10");
    descriptionInput.setAttribute("type","text");
    descriptionInput.setAttribute("id",`descriptionInput${lineItemCount}`);
    descriptionInput.setAttribute("name",`lineItems[item${lineItemCount}][description]`);
    descriptionInput.setAttribute("placeholder","Description");
    descriptionInput.setAttribute("data-toggle","dropdown");
    descriptionInput.setAttribute("autocomplete","off");
    descriptionInput.setAttribute("required",true);
    descriptionInput.addEventListener("keydown",updateDropdown);
    descriptionInput.addEventListener("click",updateDropdown);

    const inputGroup = document.createElement("div");
    inputGroup.classList.add("input-group","col-5","col-sm-4","col-md-3","col-lg-2");

    const dollarSignSpan = document.createElement("span");
    dollarSignSpan.classList.add("input-group-text");
    dollarSignSpan.innerText = "$";

    const amountInput = document.createElement("input");
    amountInput.classList.add("form-control","line-item-amount");
    amountInput.setAttribute("type","number");
    amountInput.setAttribute("id",`amountInput${lineItemCount}`);
    amountInput.setAttribute("name",`lineItems[item${lineItemCount}][amount]`);
    amountInput.setAttribute("placeholder","0.00");
    amountInput.setAttribute("step","0.01");
    amountInput.setAttribute("min","0");
    amountInput.setAttribute("required",true);
    amountInput.addEventListener("change",updateTotal);

// <ul role="menu" aria-labelledby="descriptionInput0">
//     <a class="btn btn-block btn-outline-primary m-0" href="/items/new">
//         <li class="text-left" role="menuitem">&plus; Create New Item</li>
//     </a>
//     <div id="searchResultDiv">
//         <!-- search results for descriptionInput0 will be added here -->
//     </div>
// </ul>

    const dropDownUl = document.createElement("ul");
    dropDownUl.classList.add("dropdown-menu","p-0","pre-scrollable");
    dropDownUl.setAttribute("role","menu");
    dropDownUl.setAttribute("aria-labelledby",`descriptionInput${lineItemCount}`);

    const buttonLink = document.createElement("a");
    buttonLink.classList.add("btn","btn-block","btn-outline-primary","m-0");
    buttonLink.setAttribute("href","/items/new");

    const newItemLi = document.createElement("li");
    newItemLi.classList.add("text-left");
    newItemLi.setAttribute("role","menuitem");
    newItemLi.innerHTML = "&plus; Create New Item";

    const searchResultDiv = document.createElement("div");
    searchResultDiv.setAttribute("id",`searchResultDiv${lineItemCount}`);

    itemDiv.append(descriptionInput);
    inputGroup.append(dollarSignSpan);
    inputGroup.append(amountInput);
    itemDiv.append(inputGroup);
    buttonLink.append(newItemLi);
    dropDownUl.append(buttonLink);
    dropDownUl.append(searchResultDiv);
    itemDiv.append(dropDownUl);
    lineItemsDiv.append(itemDiv);

    removeItemButton.removeAttribute("hidden");
};

const removeLastLineItem = function(){
    const lineItemDivs = document.querySelectorAll(".line-item");
    if(lineItemCount){
        lineItemDivs[lineItemCount].remove();
    };
    if(lineItemCount<=1){
        removeItemButton.setAttribute("hidden",true);
    };
    lineItemCount-=1;
    updateTotal();
};

addItemButton.addEventListener("click",addLineItem);
removeItemButton.addEventListener("click",removeLastLineItem);