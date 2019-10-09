'use strict'

const assert = require('assert')
const CreditItem = require('./CreditItem')

const defaultOptions = {
  additive: false
}

class CreditEntry {
  constructor (options) {
    this._options = {};
    this._options.additive = options.additive || defaultOptions.additive
    this._options.invoiceId = options.invoiceId
    this._options.items = options.items
  }

  _generateXML (indentLevel) {
    indentLevel = indentLevel || 0

    assert(this._options.additive !== undefined, 'additive must be specified')
    assert(typeof this._options.invoiceId === 'string' && this._options.invoiceId.trim().length > 1)
    
    assert(Array.isArray(this._options.items),
      'Valid Items array missing from credit entry options')

    assert(this._options.items.length < 6 && this._options.items.length > 0, 
        'Items array must be between 1 and 5 entries')

    
    let o = this._options.items.map(creditItem => {
      assert(creditItem instanceof CreditItem, 'Element in Items array is not an instance of the CreditItem class')
      return creditItem._generateXML(indentLevel)
    }).join('')
    return o
  }

  _getInvoiceId(){
      return this._options.invoiceId
  }

  _getAdditive(){
      return this._options.additive
  }

}

module.exports = CreditEntry
