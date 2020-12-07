const knex = require('knex');
const db = require('../../data/db-config');

const findAll = async () => {
    return await db('invoices').select('*');
};

const findById = async id => {
    return await db('invoices').where({ id }).first().select('*');
};

const findAllByUserId = async user_id => {
    return await db('invoices')
        .where({ user_id: user_id })
        .innerJoin('users', 'invoices.user_id', 'users.id')
        .innerJoin('clients', 'invoices.client_id', 'clients.id')
        .select('*');
};

const findAllByClientId = async client_id => {
    return await db('invoices').where({ client_id: client_id }).select('*');
};

const create = async invoice => {
    return await db('invoices').insert(invoice).returning('*');
};

const update = async (id, invoice) => {
    return await db('invoices')
        .where({ id })
        .first()
        .update(invoice)
        .returning('*');
};

const remove = async id => {
    return await db('invoices').where({ id }).del();
};

const addInvoiceItem = async (invoice_id, item_id) => {
    return await db('invoice_items')
        .insert({ invoice_id: invoice_id, item_id: item_id })
        .returning('*');
};

const removeInvoiceItem = async (invoice_id, item_id) => {
    return await db('invoice_items')
        .where({ invoice_id: invoice_id, item_id: item_id })
        .del();
};

module.exports = {
    findAll,
    findById,
    findAllByUserId,
    findAllByClientId,
    create,
    update,
    remove,
    addInvoiceItem,
    removeInvoiceItem,
};
