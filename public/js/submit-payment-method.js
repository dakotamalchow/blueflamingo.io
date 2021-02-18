const stripe = Stripe("pk_test_osZfCwd1uI7FjnfaUqWxbu2R");
const elements = stripe.elements();

const setDisplayError = ({error})=>{
    let displayError = document.querySelector("#card-errors");
    if(error){
        displayError.textContent = error.message;
    }
    else{
        displayError.textContent = "";
    };
}

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
    }
    else{
        stripePaymentMethodHandler(paymentMethod);
    };
});

const stripePaymentMethodHandler = (paymentMethod)=>{
    const form = document.querySelector("#payment-form");
    const hiddenInput = document.createElement("input");
    hiddenInput.setAttribute("type", "hidden");
    hiddenInput.setAttribute("name", "stripePaymentMethod");
    hiddenInput.setAttribute("value", paymentMethod.id);
    form.appendChild(hiddenInput);
    form.submit();
};  