let backgroundColor = "";
const invoiceStatusSpan = document.querySelector(".invoice-status");

switch(invoiceStatusSpan.innerText){
    case "draft":
        backgroundColor += "bg-secondary";
        break;
    case "open":
        backgroundColor += "bg-success";
        break;
    case "paid":
        backgroundColor += "bg-primary";
        break;
    default:
        backgroundColor += "bg-danger"
};

invoiceStatusSpan.classList.add(backgroundColor);