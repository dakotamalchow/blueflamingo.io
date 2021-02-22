const stripe = Stripe("pk_test_osZfCwd1uI7FjnfaUqWxbu2R");
const elements = stripe.elements();

const setDisplayError = ({error})=>{
    let displayError = document.querySelector("#card-errors");
    if(error){
        displayError.textContent = error.message;
        displayError.removeAttribute("hidden");
    }
    else{
        displayError.textContent = "";
        displayError.setAttribute("hidden",true);
    };
};

const cardNumberElement = elements.create('cardNumber');
cardNumberElement.mount("#cardNumber");
cardNumberElement.on("change",setDisplayError);
const cardExpiryElement = elements.create('cardExpiry');
cardExpiryElement.mount("#cardExpiry");
cardExpiryElement.on("change",setDisplayError);
const cardCvcElement = elements.create('cardCvc');
cardCvcElement.mount("#cardCvc");
cardCvcElement.on("change",setDisplayError);

const form = document.querySelector("#payment-form");
form.addEventListener("submit",async(event)=>{
    event.preventDefault();
    disableForm(true);
    const postalCode = document.querySelector("#postalCode").value;
    const {paymentMethod,error} = await stripe.createPaymentMethod({
        type:"card",
        card:cardNumberElement,
        billing_details:{
            address:{
                postal_code: postalCode
            }
        }
    });
    if (error){
        const errorElement = document.querySelector("#card-errors");
        errorElement.textContent = error.message;
        disableForm(false);
    }
    else{
        stripePaymentMethodHandler(paymentMethod);
        setTimeout(()=>{
                disableForm(false);
        },5000);
    };
});

const formElements = document.querySelectorAll("#payment-form input, #payment-form button");
const formButton = document.querySelector("#payment-form button");
// <!-- <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> -->
const spinner = document.createElement("span");
spinner.classList.add("spinner-border","spinner-border-sm");
spinner.setAttribute("role","status");
spinner.setAttribute("aria-hidden","true");

const disableForm = (isDisabled)=>{
    if(isDisabled){
        for(let formElement of formElements){
            formElement.setAttribute("disabled",isDisabled);
        };
        formButton.prepend(spinner);
    }
    else{
        for(let formElement of formElements){
            formElement.removeAttribute("disabled");
        };
        spinner.remove();
    };
};

const promoCode = document.querySelector("#promoCode");

const stripePaymentMethodHandler = (paymentMethod)=>{
    const form = document.querySelector("#payment-form");
    const hiddenInput = document.createElement("input");
    hiddenInput.setAttribute("type", "hidden");
    hiddenInput.setAttribute("name", "stripePaymentMethod");
    hiddenInput.setAttribute("value", paymentMethod.id);
    form.appendChild(hiddenInput);
    //this is a temp solution until a better way to show a loading screen is implemented
    if(promoCode){
        const hiddenInput2 = document.createElement("input");
        hiddenInput2.setAttribute("type", "hidden");
        hiddenInput2.setAttribute("name", "promoCode");
        hiddenInput2.setAttribute("value", promoCode.value);
        form.appendChild(hiddenInput2);
    };
    form.submit();
};  