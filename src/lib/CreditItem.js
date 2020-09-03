'use strict'

const assert = require('assert')
const XMLUtils = require('./XMLUtils')
const Constants = require('./Constants').setup()


const defaultOptions = {
  itemDate: new Date(),
  paymentMethod: Constants.PaymentMethod.BankTransfer,
  description: ''
}

class CreditItem {
  constructor (options) {
    this._options = {};
    this._options.itemDate = options.itemDate || defaultOptions.itemDate
    this._options.paymentMethod = options.paymentMethod || defaultOptions.paymentMethod
    this._options.amount = options.amount
    this._options.description = options.description || defaultOptions.description
  }

  _generateXML (indentLevel) {
    assert(this._options.itemDate instanceof Date || typeof this._options.itemDate  == "string",
    'Valid Date field missing from item options')

    assert(this._options.paymentMethod instanceof Constants.Interface.PaymentMethod,
      'Valid PaymentMethod field missing from item options')

    assert(typeof this._options.amount === 'number' && this._options.amount !== 0,
      'Valid Amount value missing from item options') 

    assert(typeof this._options.description === 'string',
      'Valid Description value missing from item options')
    
    indentLevel = indentLevel || 0

    return XMLUtils.wrapWithElement('kifizetes', [
      [ 'datum', this._options.itemDate ],
      [ 'jogcim', this._options.paymentMethod.value.toLowerCase() ],
      [ 'osszeg', this._options.amount ],
      [ 'leiras', this._options.description ],
     
    ], indentLevel)
  }
}
module.exports = CreditItem
