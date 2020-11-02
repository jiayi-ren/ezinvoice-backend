const db = require('../../data/db-config');

const findAll = async () => {
    return await db('userSettings').select('*');
};

const findByUserId = async userId => {
    return await db('userSettings')
        .where({ userId: userId })
        .first()
        .select('*');
};

const findById = async id => {
    return await db('userSettings').where({ id }).first().select('*');
};

const create = async setting => {
    return await db('userSettings').insert(setting).returning('*');
};

const update = async (id, setting) => {
    return await db('userSettings')
        .where({ id: id })
        .first()
        .update(setting)
        .returning('*');
};

const remove = async id => {
    return await db('userSettings').where({ id }).del();
};

module.exports = {
    findAll,
    findByUserId,
    findById,
    create,
    update,
    remove,
};
