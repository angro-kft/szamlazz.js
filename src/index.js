'use strict'

const _modules = [ 'Buyer', 'Client', 'Invoice', 'Item', 'Seller', 'CreditEntry', 'CreditItem' ]

_modules.forEach(n => {
  exports[ n ] = require('./lib/' + n)
})

require('./lib/Constants').setup(exports)
