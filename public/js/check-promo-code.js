const promoCodeInput = document.querySelector("#promoCode");
const promoCodeConfirmation = document.querySelector("#promoCodeConfirmation");

const checkPromoCode = ()=>{
    setTimeout(()=>{
        if(promoCodeInput.value.toUpperCase()=="1FLAMINGO"){
            promoCodeConfirmation.innerText = "The applied promo code will give you your first month for free. ";
            promoCodeConfirmation.innerText += " You will be charged on a recurring basis after that, but can cancel any time.";
        }
        else if(promoCodeInput.value.toUpperCase()=="2FLAMINGOS"){
            promoCodeConfirmation.innerText = "The applied promo code will give you your first two months for free. ";
            promoCodeConfirmation.innerText += " You will be charged on a recurring basis after that, but can cancel any time.";
        }
        else{
            promoCodeConfirmation.innerText = "";
        };
    },50);
};

promoCodeInput.addEventListener("keydown",checkPromoCode);