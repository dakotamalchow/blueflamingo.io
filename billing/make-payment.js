var stripe = Stripe("pk_test_osZfCwd1uI7FjnfaUqWxbu2R");
const payment = {
    amount: amount
}
const config = {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify(payment)
}
fetch("/make-payment",config)
.then((result)=>{
    return result.json();
})
.then((data)=>{
    const elements = stripe.elements();
    const card = elements.create("card");
    card.mount("#card-element");
    const form = document.querySelector("#payment-form");
    form.addEventListener("submit",(event)=>{
        event.preventDefault();
        payWithCard(stripe,card,data.clientSecret);
    });
})

const payWithCard = (stripe,card,clientSecret)=>{
    stripe.confirmCardPayment(clientSecret,{
        payment_method:{
            card: card
        }
    })
    .then(function(result){
        if (result.error){
          showError(result.error.message);
        } else {
          console.log("Payment successful");
        }
    });
};