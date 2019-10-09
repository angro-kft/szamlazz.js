/**
 * Create client
 * @return {Client}
 */
exports.createClient = function (Szamlazz) {
  return new Szamlazz.Client({
    user: '',
    password: '',
    agentKey: '6vs3shap2c25c24ewr89evvmv798s75kb9a5snrfif',
    eInvoice: false,
    passpharase: '',
    requestInvoiceDownload: true,
    downloadedInvoiceCount: 0,
    responseVersion: 1
  })
}

/**
 * Create seller
 * Optional and can be used to override the default data.
 * @return {Seller}
 */
exports.createSeller = function (Szamlazz) {
  return new Szamlazz.Seller({
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
}

/**
 * Create Buyer
 * Required, you should supply basic data: name, zip, city, address as a minimum. Hungary is the default country.
 * @return {Buyer}
 */
exports.createBuyer = function (Szamlazz) {
  return new Szamlazz.Buyer({
    name: 'Test ' + Math.random(),
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
}

/**
 * Create sold item with net price
 * @return {Item}
 */
exports.createSoldItemNet = function (Szamlazz) {
  return new Szamlazz.Item({
    label: 'First item',
    quantity: 2,
    unit: 'qt',
    vat: 27, // can be a number or a special string
    netUnitPrice: 100.55, // calculates gross and net values from per item net
    comment: 'An item'
  })
}

/**
 * Create sold item with gross price
 * @return {Item}
 */
exports.createSoldItemGross = function (Szamlazz) {
  return new Szamlazz.Item({
    label: 'Second item',
    quantity: 5,
    unit: 'qt',
    vat: 27,
    grossUnitPrice: 1270 // calculates net and total values from per item gross
  })
}

/**
 * Create invoice
 * Buyer and seller can be shared between invoices.
 * @return {Invoice}
 */
exports.createInvoice = function (Szamlazz, seller, buyer, items) {
  return new Szamlazz.Invoice({
    paymentMethod: Szamlazz.PaymentMethod.BankTransfer,
    currency: Szamlazz.Currency.Ft,
    language: Szamlazz.Language.Hungarian,
    seller: seller,
    buyer: buyer,
    items
  })
}

/**
 * Create entry item 
 * @return {EntryItem}
 */
exports.createEntryItem = function(Szamlazz){
  return new Szamlazz.CreditItem({
    itemDate: new Date(),
    paymentMethod: Szamlazz.PaymentMethod.BankTransfer,
    amount: 10000
  })
}

/**
 * Create entry item with description
 * @return {EntryItem}
 */
exports.createEntryItemDesc = function(Szamlazz){
  return new Szamlazz.CreditItem({
    itemDate: new Date(),
    paymentMethod: Szamlazz.PaymentMethod.Cash,
    amount: 5000,
    description: 'This is a test'
  })
}

/**
 * Create credit entry
 * @return {CreditEntry}
 */
exports.createCreditEntry = function (Szamlazz, additive, invoiceId, items){
  return new Szamlazz.CreditEntry({
    additive: additive,
    invoiceId: invoiceId,
    items
  })
}
