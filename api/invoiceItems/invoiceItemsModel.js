const db = require('../../data/db-config');

const findAll = async () => {
    return await db('invoice_items');
};

const findByInvoiceId = invoiceId => {
    return db('invoice_items').where({ invoiceId }).returning('*');
};

const findById = async id => {
    return db('invoice_items').where({ id }).first().select('*');
};

const create = async invoiceItem => {
    return db('invoice_items').insert(invoiceItem).returning('*');
};

const update = (id, invoiceItem) => {
    return db('invoice_items')
        .where({ id: id })
        .first()
        .update(invoiceItem)
        .returning('*');
};

const remove = async id => {
    return await db('invoice_items').where({ id }).del();
};

module.exports = {
    findAll,
    findByInvoiceId,
    findById,
    create,
    update,
    remove,
};
