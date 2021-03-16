const form = document.querySelector("#filter-and-sort");
const sortCols = document.querySelectorAll(".sortCol");

const sortColumn = function(){
    const urlParams = new URLSearchParams(window.location.search);
    const sortOrder = (urlParams.get("sortBy")==this.dataset.query)&&(urlParams.get("sortOrder")==1)?-1:1
    const hiddenInput = document.createElement("input");
    hiddenInput.setAttribute("type","hidden");
    hiddenInput.setAttribute("name","sortBy");
    hiddenInput.setAttribute("value",this.dataset.query);
    const hiddenInput2 = document.createElement("input");
    hiddenInput2.setAttribute("type","hidden");
    hiddenInput2.setAttribute("name","sortOrder");
    hiddenInput2.setAttribute("value",sortOrder);
    form.appendChild(hiddenInput);
    form.appendChild(hiddenInput2);
    form.submit();
};

for(let sortCol of sortCols){
    sortCol.addEventListener("click",sortColumn);
};