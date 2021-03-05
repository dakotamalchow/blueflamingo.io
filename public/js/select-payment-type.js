const cardSelect = document.querySelector("#card-select");
const bankSelect = document.querySelector("#bank-select");
const buttons = document.querySelectorAll("#select-payment-type button");
const forms = document.querySelectorAll("form");

const selectForm = function(){
    for(let button of buttons){
        button.classList.remove("btn-primary");
        button.classList.add("btn-outline-primary");
    };
    this.classList.remove("btn-outline-primary");
    this.classList.add("btn-primary");
    for(let form of forms){
        form.setAttribute("hidden",true);
    };
    document.querySelector(this.dataset.form).removeAttribute("hidden");
};

cardSelect.addEventListener("click",selectForm);
bankSelect.addEventListener("click",selectForm);