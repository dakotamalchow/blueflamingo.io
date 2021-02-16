const addItemButton = document.querySelector("#add-item-button");
const removeItemButton = document.querySelector("#remove-item-button");
const itemsDiv = document.querySelector("#line-items");

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

/*
<div class="row ml-0 mb-2 line-item">
    <input class="form-control col-7" type="text" name="lineItems[item#][description]" placeholder="Description" required>
    <div class="input-group col-5">
        <span class="input-group-text">$</span>
        <input class="form-control line-item-amount" type="number" name="lineItems[item#][amount]" placeholder="0.00" step="0.01" required>
    </div>
</div>
*/

const addLineItem = function(){
    lineItemCount+=1;

    const itemDiv = document.createElement("div");
    itemDiv.classList.add("row","ml-0","mb-2","line-item");

    const descriptionInput = document.createElement("input");
    descriptionInput.classList.add("form-control","col-7");
    descriptionInput.setAttribute("type","text");
    descriptionInput.setAttribute("name",`lineItems[item${lineItemCount}][description]`);
    descriptionInput.setAttribute("placeholder","Description");
    descriptionInput.setAttribute("required",true);

    const inputGroup = document.createElement("div");
    inputGroup.classList.add("input-group","col-5");

    const dollarSignSpan = document.createElement("span");
    dollarSignSpan.classList.add("input-group-text");
    dollarSignSpan.innerText = "$";

    const amountInput = document.createElement("input");
    amountInput.classList.add("form-control","line-item-amount");
    amountInput.setAttribute("type","number");
    amountInput.setAttribute("name",`lineItems[item${lineItemCount}][amount]`);
    amountInput.setAttribute("placeholder","0.00");
    amountInput.setAttribute("step","0.01");
    amountInput.setAttribute("required",true);
    amountInput.addEventListener("change",updateTotal);

    inputGroup.append(dollarSignSpan);
    inputGroup.append(amountInput);
    itemDiv.append(descriptionInput);
    itemDiv.append(inputGroup);
    itemsDiv.append(itemDiv);

    removeItemButton.removeAttribute("hidden");
};

const removeLastLineItem = function(){
    const lineItemDivs = document.querySelectorAll(".line-item");
    const count = lineItemDivs.length;
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