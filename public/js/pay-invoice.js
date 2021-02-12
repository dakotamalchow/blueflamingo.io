const stripe = Stripe("pk_test_osZfCwd1uI7FjnfaUqWxbu2R");
const elements = stripe.elements();

const style = {
    base: {
      // Add your base input styles here. For example:
      fontSize: '16px',
      color: '#32325d',
    },
};

const card = elements.create("card",{style});
card.mount("#card-element");
card.on("change",({error})=>{
    let displayError = document.querySelector("#card-errors");
    if(error){
        displayError.textContent = error.message;
    }
    else{
        displayError.textContent = "";
    };
});

const form = document.querySelector("#payment-form");
form.addEventListener("submit",async(event)=>{
    event.preventDefault();
    const {paymentMethod,error} = await stripe.createPaymentMethod({
        type:"card",
        card:card
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