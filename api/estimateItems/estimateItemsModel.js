const db = require('../../data/db-config');

const findAll = async () => {
    return await db('estimate_items');
};

const findByEstimateId = async estimate_id => {
    return await db('estimate_items').where({ estimate_id }).returning('*');
};

const findByItemId = async item_id => {
    return await db('estimate_items').where({ item_id }).first().select('*');
};

const create = async estimateItem => {
    return await db('estimate_items').insert(estimateItem).returning('*');
};

const update = async (estimate_id, item_id, estimateItem) => {
    return await db('estimate_items')
        .where({ estimate_id, item_id })
        .first()
        .update(estimateItem)
        .returning('*');
};

const remove = async estimate_id => {
    return await db('estimate_items').where({ estimate_id }).del();
};

module.exports = {
    findAll,
    findByEstimateId,
    findByItemId,
    create,
    update,
    remove,
};
