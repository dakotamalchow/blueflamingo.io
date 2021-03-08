let backgroundColor = "";
const invoiceStatusSpans = document.querySelectorAll(".invoice-status");

for(let invoiceStatusSpan of invoiceStatusSpans){
    switch(invoiceStatusSpan.innerText){
        case "draft":
            backgroundColor += "bg-secondary";
            break;
        case "open":
        case "pending":
            backgroundColor += "bg-success";
            break;
        case "paid":
            backgroundColor += "bg-primary";
            break;
        default:
            backgroundColor += "bg-danger"
    };
    invoiceStatusSpan.classList.add("rounded");
    invoiceStatusSpan.classList.add("text-white");
    invoiceStatusSpan.classList.add(backgroundColor);
    backgroundColor = "";
};