/* eslint-env mocha */
'use strict'

const fs = require('fs')
const path = require('path')
const xmljs = require('libxmljs2')
const sinon = require('sinon')
const mockery = require('mockery')
const expect = require('chai').expect

const setup = require('./resources/setup')

let requestStub

let client
let seller
let buyer
let soldItem1
let soldItem2
let invoice
let entryItem1
let entryItem2
let creditEntry

let Szamlazz

beforeEach(function (done) {
  mockery.enable({
    warnOnReplace: false,
    warnOnUnregistered: false,
    useCleanCache: true
  })

  requestStub = sinon.stub()
  requestStub.jar = function () {}

  mockery.registerMock('request', requestStub)

  Szamlazz = require('..')
  client = setup.createClient(Szamlazz)
  seller = setup.createSeller(Szamlazz)
  buyer = setup.createBuyer(Szamlazz)
  soldItem1 = setup.createSoldItemNet(Szamlazz)
  soldItem2 = setup.createSoldItemGross(Szamlazz)
  invoice = setup.createInvoice(Szamlazz, seller, buyer, [ soldItem1, soldItem2 ])
  entryItem1 = setup.createEntryItem(Szamlazz)
  entryItem2 = setup.createEntryItemDesc(Szamlazz)
  creditEntry = setup.createCreditEntry(Szamlazz, false, "2016-139", [entryItem1, entryItem2 ])

  done()
})

afterEach(function (done) {
  mockery.disable()
  done()
})

describe('Client', function () {
  describe('constructor', function () {
    it('should set _options property', function (done) {
      expect(client).to.have.property('_options').that.is.an('object')
      done()
    })

    it('should set user', function (done) {
      expect(client._options).to.have.property('user').that.is.a('string')
      done()
    })

    it('should set password', function (done) {
      expect(client._options).to.have.property('password').that.is.a('string')
      done()
    })
    it('should set agent key', function(done){
      expect(client._options).to.have.property('agentKey').that.is.a('string')
      done()
    })
  })

  describe('_generateInvoiceXML', function () {
    it('should return valid XML', function (done) {
      fs.readFile(path.join(__dirname, 'resources', 'xmlszamla.xsd'), function (err, data) {
        if (!err) {
          let xsd = xmljs.parseXmlString(data)
          let xml = xmljs.parseXmlString(client._generateInvoiceXML(invoice))
          expect(xml.validate(xsd)).to.be.true
          done()
        }
      })
    })
  })

  
  describe('_generateCreditEntryXML', function () {
    it('should return valid XML', function (done) {
      fs.readFile(path.join(__dirname, 'resources', 'xmlszamlakifiz.xsd'), function (err, data) {
        if (!err) {
          let xsd = xmljs.parseXmlString(data)
          let xml = xmljs.parseXmlString(client._generateCreditEntryXML(creditEntry))
          expect(xml.validate(xsd)).to.be.true
          done()
        }
      })
    })
  })

  describe('issueInvoice', function () {
    describe('HTTP status', function () {
      it('should handle failed requests', function (done) {
        requestStub.yields(null, {
          statusCode: 500,
          statusMessage: 'Internal Server Error'
        })

        client.issueInvoice(invoice, function (err, body, response) {
          expect(err).to.be.a('error')
          done()
        })
      })
    })

    describe('service error response', function () {
      beforeEach(function (done) {
        requestStub.yields(null, {
          statusCode: 200,
          headers: {
            szlahu_error_code: '57',
            szlahu_error: 'Some error message from the remote service'
          }
        })
        done()
      })

      it('should have error parameter', function (done) {
        client.issueInvoice(invoice, function (err) {
          expect(err).to.be.a('error')
          done()
        })
      })

      it('should have `szlahu_error_code` property', function (done) {
        client.issueInvoice(invoice, function (e, body, response) {
          expect(response.headers).to.have.property('szlahu_error_code')
          done()
        })
      })

      it('should have `szlahu_error` property', function (done) {
        client.issueInvoice(invoice, function (e, body, response) {
          expect(response.headers).to.have.property('szlahu_error')
          done()
        })
      })
    })

    describe('successful invoice generation without download request', function () {
      beforeEach(function (done) {
        fs.readFile(path.join(__dirname, 'resources', 'success_without_pdf.xml'), function (e, data) {
          requestStub.yields(null, {
            statusCode: 200,
            headers: {
              szlahu_bruttovegosszeg: '6605',
              szlahu_nettovegosszeg: '5201',
              szlahu_szamlaszam: '2016-139'
            }
          }, data)
          client.setRequestInvoiceDownload(false)
          done()
        })
      })

      it('should have result parameter', function (done) {
        client.issueInvoice(invoice, function (err, result) {
          expect(err).to.be.a('null')

          expect(result).to.have.all.keys(
            'invoiceId',
            'netTotal',
            'grossTotal'
          )

          done()
        })
      })

      it('should have `invoiceId` property', function (done) {
        client.issueInvoice(invoice, function (err, result) {
          expect(err).to.be.a('null')
          expect(result).to.have.property('invoiceId').that.is.a('string')
          done()
        })
      })

      it('should have `netTotal` property', function (done) {
        client.issueInvoice(invoice, function (err, result) {
          expect(err).to.be.a('null')
          expect(parseFloat(result.netTotal)).is.a('number')
          done()
        })
      })

      it('should have `grossTotal` property', function (done) {
        client.issueInvoice(invoice, function (err, result) {
          expect(err).to.be.a('null')
          expect(parseFloat(result.grossTotal)).is.a('number')
          done()
        })
      })
    })

    describe('successful invoice generation with download request', function () {
      beforeEach(function (done) {
        fs.readFile(path.join(__dirname, 'resources', 'success_without_pdf.xml'), function (e, data) {
          requestStub.yields(null, {
            statusCode: 200,
            headers: {
              szlahu_bruttovegosszeg: '6605',
              szlahu_nettovegosszeg: '5201',
              szlahu_szamlaszam: '2016-139'
            }
          }, data)

          client.setRequestInvoiceDownload(true)
          done()
        })
      })

      it('should have result parameter', function (done) {
        client.issueInvoice(invoice, function (err, result) {
          expect(err).to.be.a('null')

          expect(result).to.have.all.keys(
            'invoiceId',
            'netTotal',
            'grossTotal',
            'pdf'
          )

          done()
        })
      })

      it('should have `invoiceId` property', function (done) {
        client.issueInvoice(invoice, function (err, result) {
          expect(err).to.be.a('null')
          expect(result).to.have.property('invoiceId').that.is.a('string')
          done()
        })
      })

      it('should have `netTotal` property', function (done) {
        client.issueInvoice(invoice, function (err, result) {
          expect(err).to.be.a('null')
          expect(parseFloat(result.netTotal)).is.a('number')
          done()
        })
      })

      it('should have `grossTotal` property', function (done) {
        client.issueInvoice(invoice, function (err, result) {
          expect(err).to.be.a('null')
          expect(parseFloat(result.grossTotal)).is.a('number')
          done()
        })
      })

      it('should have `pdf` property', function (done) {
        client.issueInvoice(invoice, function (err, result) {
          expect(err).to.be.a('null')
          expect(result.pdf).to.be.an.instanceof(Buffer)
          done()
        })
      })
    })
  })

  describe('registerCreditEntry', function () {
    describe('HTTP status', function () {
      it('should handle failed requests', function (done) {
        requestStub.yields(null, {
          statusCode: 500,
          statusMessage: 'Internal Server Error'
        })

        client.registerCreditEntry(creditEntry, function (err, body, response) {
          expect(err).to.be.a('error')
          done()
        })
      })
    })

    describe('service error response', function () {
      beforeEach(function (done) {
        requestStub.yields(null, {
          statusCode: 200,
          headers: {
            szlahu_error_code: '57',
            szlahu_error: 'Some error message from the remote service'
          }
        })
        done()
      })

      it('should have error parameter', function (done) {
        client.registerCreditEntry(creditEntry, function (err) {
          expect(err).to.be.a('error')
          done()
        })
      })

      it('should have `szlahu_error_code` property', function (done) {
        client.registerCreditEntry(creditEntry, function (e, body, response) {
          expect(response.headers).to.have.property('szlahu_error_code')
          done()
        })
      })

      it('should have `szlahu_error` property', function (done) {
        client.registerCreditEntry(creditEntry, function (e, body, response) {
          expect(response.headers).to.have.property('szlahu_error')
          done()
        })
      })
    })

    describe('successfully creating credit entry', function () {
      beforeEach(function (done) {
          requestStub.yields(null, {
            statusCode: 200,
            headers: {
              szlahu_bruttovegosszeg: '6605',
              szlahu_nettovegosszeg: '5201',
              szlahu_szamlaszam: '2016-139'
            }
          })
          client.setRequestInvoiceDownload(false)
          done()
      })

      it('should have result parameter', function (done) {
        client.registerCreditEntry(creditEntry, function (err, result) {
          expect(err).to.be.a('null')

          expect(result).to.have.all.keys(
            'invoiceId',
            'netTotal',
            'grossTotal'
          )

          done()
        })
      })

      it('should have `invoiceId` property', function (done) {
        client.registerCreditEntry(creditEntry, function (err, result) {
          expect(err).to.be.a('null')
          expect(result).to.have.property('invoiceId').that.is.a('string')
          done()
        })
      })

      it('should have `netTotal` property', function (done) {
        client.registerCreditEntry(creditEntry, function (err, result) {
          expect(err).to.be.a('null')
          expect(parseFloat(result.netTotal)).is.a('number')
          done()
        })
      })

      it('should have `grossTotal` property', function (done) {
        client.registerCreditEntry(creditEntry, function (err, result) {
          expect(err).to.be.a('null')
          expect(parseFloat(result.grossTotal)).is.a('number')
          done()
        })
      })
    })
  })
})
