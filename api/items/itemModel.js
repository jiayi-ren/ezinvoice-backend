const db = require('../../data/db-config');

const findAll = async () => {
    return await db('items').select('*');
};

const findById = async id => {
    return await db('items').where({ id }).first().select('*');
};

const findByDescription = async description => {
    return await db('items')
        .where({ description: description })
        .first()
        .select('*');
};

const findAllByUserId = async user_id => {
    return await db('items').where({ user_id: user_id }).select('*');
};

const create = async item => {
    return await db('items').insert(item).returning('*');
};

const update = async (id, item) => {
    return await db('items').where({ id }).first().update(item).returning('*');
};

const remove = async id => {
    return await db('items').where({ id }).del();
};

module.exports = {
    findAll,
    findById,
    findByDescription,
    findAllByUserId,
    create,
    update,
    remove,
};
