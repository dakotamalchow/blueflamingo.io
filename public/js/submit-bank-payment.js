(async ()=>{
    const linkToken = document.querySelector("#plaidLinkToken").value;
    const linkHandler = Plaid.create({
        token: linkToken,
        onSuccess: (public_token,metadata)=>{
            const form = document.querySelector("#bank-payment-form");
            const div = document.querySelector("#bank-payment-div");
            while(div.firstChild){
                div.removeChild(div.firstChild);
            };
            const nameEl = document.createElement("h5");
            nameEl.innerText = metadata.account.name;
            const maskEl = document.createElement("p");
            maskEl.innerText = `***${metadata.account.mask}`;
            payButton = document.createElement("button");
            payButton.classList.add("btn","btn-primary","btn-lg","px-5");
            payButton.setAttribute("id","bank-submit-button");
            payButton.innerText = "Pay Invoice with Bank Account";
            div.appendChild(nameEl);
            div.appendChild(maskEl);
            div.appendChild(payButton);
            form.appendChild(div);
            form.addEventListener("submit",async(event)=>{
                event.preventDefault();
                disableForm(true);
                const hiddenInput = document.createElement("input");
                hiddenInput.setAttribute("type", "hidden");
                hiddenInput.setAttribute("name", "plaidLinkPublicToken");
                hiddenInput.setAttribute("value", public_token);
                form.appendChild(hiddenInput);
                const hiddenInput2 = document.createElement("input");
                hiddenInput2.setAttribute("type", "hidden");
                hiddenInput2.setAttribute("name", "plaidAccountId");
                hiddenInput2.setAttribute("value", metadata.account.id);
                form.appendChild(hiddenInput2);
                const hiddenInput3 = document.createElement("input");
                hiddenInput3.setAttribute("type","hidden");
                hiddenInput3.setAttribute("name","paymentType");
                hiddenInput3.setAttribute("value","bank");
                form.appendChild(hiddenInput3)
                form.submit();
                setTimeout(()=>{
                    disableForm(false);
                },5000);
            });
            const formElements = document.querySelectorAll("#bank-payment-form input, button");
            const formButton = document.querySelector("#bank-submit-button");
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
        },
        onExit: async (err,metadata)=>{
            if(err){
                console.log("err",err);
            };
            console.log("onExit metadata",metadata);
        },
        env:"development"
    });

    // <!-- <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> -->
    const spinner = document.createElement("span");
    spinner.classList.add("spinner-border","spinner-border-sm");
    spinner.setAttribute("role","status");
    spinner.setAttribute("aria-hidden","true");

    document.querySelector("#link-button").addEventListener("click",()=>{
        linkHandler.open();
    });
})();