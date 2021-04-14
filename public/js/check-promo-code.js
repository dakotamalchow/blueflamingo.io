const promoCodeInput = document.querySelector("#promoCode");
const promoCodeConfirmation = document.querySelector("#promoCodeConfirmation");

const checkPromoCode = ()=>{
    setTimeout(()=>{
        if(promoCodeInput.value.toUpperCase()=="1FLAMINGO"){
            promoCodeConfirmation.innerHTML = "The applied promo code will give you your <b>first</b> month for free.";
            promoCodeConfirmation.innerHTML += " You will be charged on a recurring basis after that, but can cancel any time.";
        }
        else if(promoCodeInput.value.toUpperCase()=="2FLAMINGOS"){
            promoCodeConfirmation.innerHTML = "The applied promo code will give you your first <b>two</b> months for free.";
            promoCodeConfirmation.innerHTML += " You will be charged on a recurring basis after that, but can cancel any time.";
        }
        else{
            promoCodeConfirmation.innerText = "";
        };
    },50);
};

promoCodeInput.addEventListener("keydown",checkPromoCode);