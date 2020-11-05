const db = require('../../data/db-config');

const findAll = async () => {
    return await db('clients').select('*');
};

const findById = async id => {
    return await db('clients').where({ id }).first().select('*');
};

const findByEmail = async email => {
    return await db('clients').where({ email: email }).first().select('*');
};

const findAllByUserId = async user_id => {
    return await db('clients').where({ user_id: user_id }).select('*');
};

const create = async client => {
    return await db('clients').insert(client).returning('*');
};

const update = async (id, client) => {
    return await db('clients')
        .where({ id })
        .first()
        .update(client)
        .returning('*');
};

const remove = async id => {
    return await db('clients').where({ id }).del();
};

module.exports = {
    findAll,
    findById,
    findByEmail,
    findAllByUserId,
    create,
    update,
    remove,
};