# szamlazz.js

A Node.js client for Szamlazz.hu

## Installation

```
npm install szamlazz.js --save
```

## Usage

```javascript
const szamlazz = require('szamlazz.js')
```

### Create a client

```javascript
const szamlazzClient = new szamlazz.Client({
  user: 'USERNAME',
  password: 'PASSWORD',
  agentKey: 'AGENT KEY',
  eInvoice: false, // create e-invoice. optional, default: false
  passpharase: '', // passpharase for e-invoice. optional
  requestInvoiceDownload: true, // downloads the issued pdf invoice. optional, default: false
  downloadedInvoiceCount: 1, // optional, default: 1
  responseVersion: 1 // optional, default: 1
})
```

You can reuse this client to issue invoices.

### Create a seller

```javascript
let seller = new szamlazz.Seller({ // everyting is optional
  bank: {
    name: 'Test Bank <name>',
    accountNumber: '11111111-11111111-11111111'
  },
  email: {
    replyToAddress: 'test@email.com',
    subject: 'Invocie email subject',
    message: 'This is an email message'
  },
  issuerName: ''
})

```

### Create a buyer

```javascript
let buyer = new szamlazz.Buyer({
  name: 'Some Buyer Name ' + Math.random(),
  country: '',
  zip: '1234',
  city: 'City',
  address: 'Some street address',
  taxNumber: '12345678-1-42',
  postAddress: {
    name: 'Some Buyer Name',
    zip: '1234',
    city: 'City',
    address: 'Some street address'
  },
  issuerName: '',
  identifier: 1,
  phone: '',
  comment: ''
})
```

### Create an invoice item

With net unit price:
```javascript
let soldItem1 = new szamlazz.Item({
  label: 'First item',
  quantity: 2,
  unit: 'qt',
  vat: 27, // can be a number or a special string
  netUnitPrice: 100.55, // calculates gross and net values from per item net
  comment: 'Ez egy árvíztűrő tükörfúrógép'
})
```

With gross unit price:

```javascript
let soldItem2 = new szamlazz.Item({
  label: 'Second item',
  quantity: 5,
  unit: 'qt',
  vat: 27,
  grossUnitPrice: 1270 // calculates net and total values from per item gross
})
```

### Create an invoice

You can create an invoice with the instances created above:

```javascript
let invoice = new szamlazz.Invoice({
  paymentMethod: szamlazz.PaymentMethod.BankTransfer, // optional, default: BankTransfer
  currency: szamlazz.Currency.Ft, // optional, default: Ft
  language: szamlazz.Language.Hungarian, // optional, default: Hungarian
  seller: seller, // the seller, required
  buyer: buyer, // the buyer, required
  items: [ soldItem1, soldItem2 ] // the sold items, required
})
```

### Create a credit item

```javascript
let creditItem = new Szamlazz.CreditItem({
    itemDate: new Date(), // optional, default: new Date()
    paymentMethod: Szamlazz.PaymentMethod.Cash, // optional, default: BankTransfer
    amount: 5000, // amount paid, required
    description: 'This is a test' // optional, default: ''
  })
```

### Create a credit entry

```javascript
let creditEntry = new Szamlazz.CreditEntry({
    additive: additive, // optional, default: false
    invoiceId: invoiceId, // invoice number, required
    items: [ creditItem ] // array of credit items, max. 5 items, required
  })
```

To issue the invoice with szamlazz.hu:

```javascript
szamlazzClient.issueInvoice(invoice, (e, result) =>
{
  if (e) {
    console.error(e.message, e.code) // handle errors
    throw e;
  }

  if (result.pdf) {
    // a Buffer with the pdf data is available if requestInvoiceDownload === true
  }
})
```

### Get invoice data

You can get the data of a previously issued invoice:

```
const szamlazzClient = new szamlazz.Client({
  user: 'USERNAME',
  password: 'PASSWORD'
})

const getInvoiceData = util.promisify(szamlazzClient.getInvoiceData).bind(szamlazzClient)
const invoice = await getInvoiceData({
  invoiceId: 'E-RNJLO-2019-1234', // invoice number
  orderNumber: '1234', // order number
  pdf: false // downloads the pdf invoice. optional, default: false
})
```

Either the invoice number or the order number must be specified.

### Reverse invoice

You can reverse a previously issued invoice:

```
const szamlazzClient = new szamlazz.Client({
  user: 'USERNAME',
  password: 'PASSWORD'
})

const reverseInvoice = util.promisify(szamlazzClient.reverseInvoice).bind(szamlazzClient)
const invoice = await reverseInvoice({
  invoiceId: 'E-RNJLO-2019-1234', // invoice number
  eInvoice: true, // create e-invoice
  requestInvoiceDownload: false, // downloads the issued pdf invoice
})
```

### Register credit entry

```javascript
szamlazzClient.registerCreditEntry(creditEntry, (e, result) =>
{
  if (e) {
    console.error(e.message, e.code) // handle errors
    throw e;
  }

  if (result) {
    //invoiceId
    //netTotal
    //grossTotal
  }
})
//OR
const registerCreditEntry = util.promisify(szamlazzClient.registerCreditEntry).bind(szamlazzClient)
const response = await registerCreditEntry(creditEntry)

```

## Constants

### PaymentMethod

The following payment methods are supported by szamlazz.hu:

```
szamlazz.PaymentMethod.Cash
szamlazz.PaymentMethod.BankTransfer
szamlazz.PaymentMethod.CreditCard
```

### Currency

The following currencies are recognized by szamlazz.hu:

```
szamlazz.Currency.Ft
szamlazz.Currency.HUF
szamlazz.Currency.EUR
szamlazz.Currency.CHF
szamlazz.Currency.USD
szamlazz.Currency.AUD
szamlazz.Currency.AED
szamlazz.Currency.BGN
szamlazz.Currency.CAD
szamlazz.Currency.CNY
szamlazz.Currency.CZK
szamlazz.Currency.DKK
szamlazz.Currency.EEK
szamlazz.Currency.GBP
szamlazz.Currency.HRK
szamlazz.Currency.ISK
szamlazz.Currency.JPY
szamlazz.Currency.LTL
szamlazz.Currency.LVL
szamlazz.Currency.NOK
szamlazz.Currency.NZD
szamlazz.Currency.PLN
szamlazz.Currency.RON
szamlazz.Currency.RUB
szamlazz.Currency.SEK
szamlazz.Currency.SKK
szamlazz.Currency.UAH
```

### Language

The accepted languages are:

```
szamlazz.Currency.Hungarian
szamlazz.Currency.English
szamlazz.Currency.German
szamlazz.Currency.Italian
szamlazz.Currency.Romanian
szamlazz.Currency.Slovak
```
