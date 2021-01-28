var stripe = Stripe("pk_test_osZfCwd1uI7FjnfaUqWxbu2R");

const postConfig = {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: invoice
}

const putCongif = {
    method: "PUT",
    headers: {
        "Content-Type": "application/json"
    },
    body: invoice
}

const invoiceId = JSON.parse(invoice)._id;

fetch("/invoices/"+invoiceId+"/pay",postConfig)
.then((result)=>{
    // console.log("result:",result)
    return result.json();
})
.then((data)=>{
    // console.log("data:",data);
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
            // showError(result.error.message);
            console.log(result.error.message);
        } else {
            fetch("/invoices/"+invoiceId+"/update",putCongif)
            .then((result)=>{
                return result.json();
            })
            .then((data)=>{
                //console.log("data:",data);
            })
            console.log("Payment successful");
        }
    });
};