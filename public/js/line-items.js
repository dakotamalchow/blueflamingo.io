const addItemButton = document.querySelector("#add-item-button");
const removeItemButton = document.querySelector("#remove-item-button");
const lineItemsDiv = document.querySelector("#line-items");
const total = document.querySelector("#total");
const subtotal = document.querySelector("#subtotal");
const tax = document.querySelector("#tax");
let lineItemCount = 0;

const addToLineItem = function(){
    const descriptionInput = document.querySelector(`#descriptionInput${this.i}`);
    descriptionInput.value = this.description;
    const amountInput = document.querySelector(`#amountInput${this.i}`);
    amountInput.value = this.amount.toFixed(2);
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
    //items is passed as a variable in the view
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

const formatAmount = function(){
    this.value = parseFloat(this.value).toFixed(2);
};

const updateLineItemTotal = function(){
    const lineItemNumber = this.id.slice(-1);
    const amount = document.querySelector(`#amountInput${lineItemNumber}`).value;
    const quantity = document.querySelector(`#quantityInput${lineItemNumber}`).value;
    const total = amount*quantity;
    document.querySelector(`#total${lineItemNumber}`).innerText = total.toFixed(2);
    updateTotals();
};

const updateTotals = function(){
    const lineItemAmounts = document.querySelectorAll(".line-item-amount");
    let newSubtotal = 0;
    let newTaxTotal = 0;
    for(let amount of lineItemAmounts){
        const amountValue = parseFloat(amount.innerText);
        newSubtotal += amountValue;
        const lineItemNumber = amount.id.slice(-1);
        const taxValue = parseFloat(document.querySelector(`#taxInput${lineItemNumber}`).value);
        newTaxTotal += amountValue*taxValue;
    };
    newSubtotal = Math.round(newSubtotal*100)/100;
    newTaxTotal = Math.round(newTaxTotal*100)/100;
    const newTotal = newSubtotal+newTaxTotal;
    subtotal.innerText = newSubtotal.toFixed(2);
    tax.innerText = newTaxTotal.toFixed(2);
    total.innerText = newTotal.toFixed(2);
};

const descriptionInput0 = document.querySelector("#descriptionInput0");
descriptionInput0.addEventListener("keydown",updateDropdown);
descriptionInput0.addEventListener("click",updateDropdown);
const amountInput0 = document.querySelector("#amountInput0");
const quantityInput0 = document.querySelector("#quantityInput0");
const taxInput0 = document.querySelector("#taxInput0");
amountInput0.addEventListener("change",formatAmount);
amountInput0.addEventListener("change",updateLineItemTotal);
quantityInput0.addEventListener("change",updateLineItemTotal);
taxInput0.addEventListener("change",updateLineItemTotal);

/*
<div class="ml-0 mb-3 line-item">
    <hr>
    <div class="form-row">
        <div class="col mb-1">
            <input class="form-control px-2" type="text" id="descriptionInput0" name="lineItems[item0][description]" placeholder="Description" data-toggle="dropdown" autocomplete="off" required>
        </div>
        <ul class="dropdown-menu p-0 pre-scrollable" role="menu" aria-labelledby="descriptionInput0">
            <a class="btn btn-block btn-outline-primary m-0" href="/items/new">
                <li class="text-left" role="menuitem">&plus; Create New Item</li>
            </a>
            <div id="searchResultDiv0">
                <!-- search results for descriptionInput0 will be added here -->
            </div>
        </ul>
    </div>
    <div class="form-row justify-content-between">
        <div class="col-6 col-sm-3 mb-1">
            <div class="input-group">
                <span class="input-group-text">$</span>
                <input class="form-control px-2" type="number" id="amountInput0" name="lineItems[item0][amount]" placeholder="0.00" step="0.01" min="0" required>
            </div>
        </div>
        <div class="col-6 col-sm-3 col-md-2 mb-1">
            <div class="input-group">
                <span class="input-group-text">x</span>
                <input class="form-control line-item-quantity px-2 text-right" type="number" id="quantityInput0" name="lineItems[item0][quantity]" value="1" min="1" required>
            </div>
        </div>
        <div class="col-6 col-sm-3 mb-1">
            <select class="custom-select" name="lineItem[item0][tax]" id="taxInput0" required>
                <option value="0">No Tax</option>
                <option value="0.07">Tax</option>
            </select>
        </div>
        <div class="col-6 col-sm-3 col-md-4 mb-1 pb-1 text-right align-self-end h5">
            <span>$</span>
            <span class="line-item-amount" id="total0">0.00<span>
        </div>
    </div>
</div>
*/

const addLineItem = function(){
    lineItemCount+=1;

    const itemDiv = document.createElement("div");
    itemDiv.classList.add("ml-0","mb-3","line-item");

    const row1Div = document.createElement("div");
    row1Div.classList.add("form-row");

    const row1col1Div = document.createElement("div");
    row1col1Div.classList.add("col","mb-1");

    const descriptionInput = document.createElement("input");
    descriptionInput.classList.add("form-control","px-2");
    descriptionInput.setAttribute("type","text");
    descriptionInput.setAttribute("id",`descriptionInput${lineItemCount}`);
    descriptionInput.setAttribute("name",`lineItems[item${lineItemCount}][description]`);
    descriptionInput.setAttribute("placeholder","Description");
    descriptionInput.setAttribute("data-toggle","dropdown");
    descriptionInput.setAttribute("autocomplete","off");
    descriptionInput.setAttribute("required",true);
    descriptionInput.addEventListener("keydown",updateDropdown);
    descriptionInput.addEventListener("click",updateDropdown);

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

    buttonLink.append(newItemLi);
    dropDownUl.append(buttonLink);
    dropDownUl.append(searchResultDiv);
    row1col1Div.append(descriptionInput);
    row1col1Div.append(dropDownUl);
    row1Div.append(row1col1Div);

    const row2Div = document.createElement("div");
    row2Div.classList.add("form-row","justify-content-between");

    const row2col1Div = document.createElement("div");
    row2col1Div.classList.add("col-6","col-sm-3","mb-1");

    const amountInputGroup = document.createElement("div");
    amountInputGroup.classList.add("input-group");

    const dollarSignSpan = document.createElement("span");
    dollarSignSpan.classList.add("input-group-text");
    dollarSignSpan.innerText = "$";

    const amountInput = document.createElement("input");
    amountInput.classList.add("form-control","px-2");
    amountInput.setAttribute("type","number");
    amountInput.setAttribute("id",`amountInput${lineItemCount}`);
    amountInput.setAttribute("name",`lineItems[item${lineItemCount}][amount]`);
    amountInput.setAttribute("placeholder","0.00");
    amountInput.setAttribute("step","0.01");
    amountInput.setAttribute("min","0");
    amountInput.setAttribute("required",true);
    amountInput.addEventListener("change",updateLineItemTotal);

    amountInputGroup.append(dollarSignSpan);
    amountInputGroup.append(amountInput);
    row2col1Div.append(amountInputGroup);

    const row2col2Div = document.createElement("div");
    row2col2Div.classList.add("col-6","col-sm-3","col-md-2","mb-1");

    const quantityInputGroup = document.createElement("div");
    quantityInputGroup.classList.add("input-group");

    const timesSpan = document.createElement("span");
    timesSpan.classList.add("input-group-text");
    timesSpan.innerText = "x";

    const quantityInput = document.createElement("input");
    quantityInput.classList.add("form-control","line-item-quantity","px-2","text-right");
    quantityInput.setAttribute("type","number");
    quantityInput.setAttribute("id",`quantityInput${lineItemCount}`);
    quantityInput.setAttribute("name",`lineItems[item${lineItemCount}][quantity]`);
    quantityInput.setAttribute("value","1");
    quantityInput.setAttribute("min","1");
    quantityInput.setAttribute("required",true);
    quantityInput.addEventListener("change",updateLineItemTotal);

    quantityInputGroup.append(timesSpan);
    quantityInputGroup.append(quantityInput);
    row2col2Div.append(quantityInputGroup);

    const row2col3Div = document.createElement("div");
    row2col3Div.classList.add("col-6","col-sm-3","mb-1");

    const taxSelect = document.createElement("select");
    taxSelect.classList.add("custom-select");
    taxSelect.setAttribute("id",`taxInput${lineItemCount}`);
    taxSelect.setAttribute("name",`lineItems[item${lineItemCount}][tax]`);
    taxSelect.setAttribute("required",true);
    taxSelect.addEventListener("change",updateLineItemTotal);

    //need to loop over tax options?
    const noTaxOption = document.createElement("option");
    noTaxOption.setAttribute("value","0");
    noTaxOption.innerText = "No Tax";

    const taxOption = document.createElement("option");
    taxOption.setAttribute("value","0.07");
    taxOption.innerText = "Tax";

    taxSelect.append(noTaxOption);
    taxSelect.append(taxOption);
    row2col3Div.append(taxSelect);

    const row2col4Div = document.createElement("div");
    row2col4Div.classList.add("col-6","col-sm-3","col-md-4","mb-1","pb-1","text-right","align-self-end","h5");

    const totalDollarSignSpan = document.createElement("span");
    totalDollarSignSpan.innerText = "$";

    const totalSpan = document.createElement("span");
    totalSpan.classList.add("line-item-amount");
    totalSpan.setAttribute("id",`total${lineItemCount}`);
    totalSpan.innerText = "0.00";
    // update item total

    row2col4Div.append(totalDollarSignSpan);
    row2col4Div.append(totalSpan);

    row2Div.append(row2col1Div);
    row2Div.append(row2col2Div);
    row2Div.append(row2col3Div);
    row2Div.append(row2col4Div);

    const hr = document.createElement("hr");

    itemDiv.append(hr);
    itemDiv.append(row1Div);
    itemDiv.append(row2Div);
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