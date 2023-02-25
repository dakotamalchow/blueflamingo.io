# Blue Flamingo

UPDATE: Blue Flamingo online invoicing is no longer an active business and the website blueflamingo.io may no longer work as expected. The below instructions may be inaccurate. 

![image](https://user-images.githubusercontent.com/16712174/161678927-64c8a677-51ac-4a0c-b03f-b65c6db0c015.png)

Online billing geared towards small business owners.

Send invoices to customer via email and accept payments via credit card or bank transfers.

## Sandbox

Poke around at [blueflamingo.io](https://blueflamingo.io/).

Use the login info:
<br>
email: test@example.com
<br>
password: Test1234

Please note that this account is for **testing** purposes only. This means that:
- Stripe is set to the test environment, payments will not process.
  - You can still use [Stripe's test cards](https://stripe.com/docs/testing#cards) to see how real payments would work.
- Plaid is set to the test environment, bank accounts will not be linked.
  - You can still use [Plaid's test credentials](https://plaid.com/docs/sandbox/test-credentials/#sandbox-simple-test-credentials) to see how linking a bank account would work.
- **Emails will still send.** Whatever email address is set for a customer is where an actual email will be sent when an invoice is created.
  - To test email functionality: Change the email in the 'Test' customer to your own email. Create an invoice and it will send to your email.
Change the email in the 'Test' account back so your email address isn't there for the next person that wants to test.

## Sections

### Invoices

Create and send new invoices. View details from previous invoices. 

![image](https://user-images.githubusercontent.com/16712174/161679028-a585f274-6f58-44d5-8bfd-ca5b894dd8d0.png)
![image](https://user-images.githubusercontent.com/16712174/161679128-280dfba1-857d-4457-b309-ee77d348b6dc.png)


Please note that **a real email will send to the customer that is chosen**.
Update the test customer to your own email address if you would like to see what the email looks like,
or add `/pay` to the end of the invoice url to see a customer view: [like this](https://blueflamingo.io/invoices/624bc24bbc671b1e29980bd1/pay).

### Customers

View, create and edit customers.

Please note that **a real email will send to the email address on file**.

### Items

View, create, and edit items. These items will be accessible from the [new invoice page](https://blueflamingo.io/invoices/new).
This allows for quick recall of the item name, amount, and tax information.

### Taxes

View, create, and edit taxes. This is used for different type of state/local taxes.

### Settings

Sorry, but this is not accessible for the test account. You will receive an error message when trying to access this page.
