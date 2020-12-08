const db = require('../../data/db-config');

const findAll = async () => {
    return await db('invoice_items');
};

const findByInvoiceId = async invoice_id => {
    return await db('invoice_items').where({ invoice_id }).returning('*');
};

const findByItemId = async item_id => {
    return await db('invoice_items').where({ item_id }).first().select('*');
};

const create = async invoiceItem => {
    return await db('invoice_items').insert(invoiceItem).returning('*');
};

const update = async (invoice_id, item_id, invoiceItem) => {
    return await db('invoice_items')
        .where({ invoice_id, item_id })
        .first()
        .update(invoiceItem)
        .returning('*');
};

const remove = async invoice_id => {
    return await db('invoice_items').where({ invoice_id }).del();
};

module.exports = {
    findAll,
    findByInvoiceId,
    findByItemId,
    create,
    update,
    remove,
};
