'use strict'
var helper = require('../../helper');
var UnitPaymentPriceCorrectionNote = require('../../../src/managers/purchasing/unit-payment-price-correction-note-manager');
var codeGenerator = require('../../../src/utils/code-generator');
var supplier = require('../master/supplier-data-util');
var unitPaymentOrder = require('./unit-payment-order-data-util');

class UnitPaymentPriceCorrectionNoteDataUtil {
    getNew() {
        return new Promise((resolve, reject) => {
            helper
                .getManager(UnitPaymentPriceCorrectionNote)
                .then(manager => {
                    Promise.all([unitPaymentOrder.getNew()])
                        .then(results => {
                            var itemsUnitPaymentPriceCorrectionNote = results[0].items.map(unitPaymentOrder => {
                                return unitPaymentOrder.unitReceiptNote.items.map(unitReceiptNoteItem => { 
                                        return {
                                            purchaseOrderId: unitReceiptNoteItem.purchaseOrderId,
                                            purchaseOrder: unitReceiptNoteItem.purchaseOrder,
                                            productId: unitReceiptNoteItem.product._id,
                                            product: unitReceiptNoteItem.product,
                                            quantity: unitReceiptNoteItem.deliveredQuantity,
                                            uomId: unitReceiptNoteItem.deliveredUom._id,
                                            uom: unitReceiptNoteItem.deliveredUom,
                                            pricePerUnit: unitReceiptNoteItem.pricePerDealUnit,
                                            priceTotal: (unitReceiptNoteItem.pricePerDealUnit * unitReceiptNoteItem.deliveredQuantity),
                                            currency: unitReceiptNoteItem.currency,
                                            currencyRate: unitReceiptNoteItem.currencyRate,
                                            remark: ''
                                        }
                                    }) 
                            });

                            itemsUnitPaymentPriceCorrectionNote = [].concat.apply([], itemsUnitPaymentPriceCorrectionNote);

                            var data = {
                                no: `UT/UPPCN/${codeGenerator()}`,
                                date: new Date(),
                                unitPaymentOrderId: results[0]._id,
                                unitPaymentOrder: results[0],
                                invoiceCorrectionNo: `UT/UPPCN/Invoice/${codeGenerator()}`,
                                invoiceCorrectionDate: new Date(),
                                incomeTaxCorrectionNo: `UT/UPPCN/PPN/${codeGenerator()}`,
                                incomeTaxCorrectionDate: new Date(),
                                vatTaxCorrectionNo: `UT/UPPCN/PPH/${codeGenerator()}`,
                                vatTaxCorrectionDate: new Date(),
                                unitCoverLetterNo: `UT/UPPCN/Letter/${codeGenerator()}`,
                                priceCorrectionType: 'Harga Satuan',
                                remark: 'Unit Test Unit payment price correction',
                                items:  itemsUnitPaymentPriceCorrectionNote
                            };

                            manager.create(data)
                                .then(id => {
                                    manager.getSingleById(id)
                                        .then(data => {
                                            resolve(data);
                                        })
                                        .catch(e => {
                                            reject(e);
                                        });
                                })
                                .catch(e => {
                                    reject(e);
                                });
                        })
                        .catch(e => {
                            reject(e);
                        });
                })
                .catch(e => {
                    reject(e);
                });
        });
    }
}

module.exports = new UnitPaymentPriceCorrectionNoteDataUtil();
