const stripe = Stripe("pk_test_osZfCwd1uI7FjnfaUqWxbu2R");
const elements = stripe.elements();

const card = elements.create("card");
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
form.addEventListener("submit",(event)=>{
    event.preventDefault();
    //disable form
    payWithCard(stripe,card,clientSecret);
    //re-enable form
});

const payWithCard = async(stripe,card,clientSecret)=>{
    const {paymentIntent, error} = await stripe.confirmCardPayment(clientSecret,{
        payment_method:{
            card: card
        }
    });
    if(error){
        console.log("Error:",error);
    }
    else if(paymentIntent && paymentIntent.status === 'succeeded'){
        console.log("Payment successful");
        //need to POST /:id/update
    };
};