const db = require('../../data/db-config');

const findAll = async () => {
    return await db('estimates').select('*');
};

const findById = async id => {
    return await db('estimates').where({ id }).first().select('*');
};

const findAllByUserId = async user_id => {
    return await db('estimates').where({ user_id: user_id }).select('*');
};

const findAllByClientId = async client_id => {
    return await db('estimates').where({ client_id: client_id }).select('*');
};

const create = async estimate => {
    return await db('estimates').insert(estimate).returning('*');
};

const update = async (id, estimate) => {
    return await db('estimates')
        .where({ id })
        .first()
        .update(estimate)
        .returning('*');
};

const remove = async id => {
    return await db('estimates').where({ id }).del();
};

const addEstimateItem = async (estimate_id, item_id) => {
    return await db('estimate_items')
        .insert({ estimate_id: estimate_id, item_id: item_id })
        .returning('*');
};

const removeEstimateItem = async (estimate_id, item_id) => {
    return await db('estimate_items')
        .where({ estimate_id: estimate_id, item_id: item_id })
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
    addEstimateItem,
    removeEstimateItem,
};
