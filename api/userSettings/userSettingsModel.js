const db = require('../../data/db-config');

const findAll = async () => {
    return await db('user_settings').select('*');
};

const findByUserId = async user_id => {
    return await db('user_settings')
        .where({ user_id: user_id })
        .first()
        .select('*');
};

const findById = async id => {
    return await db('user_settings').where({ id }).first().select('*');
};

const create = async setting => {
    return await db('user_settings').insert(setting).returning('*');
};

const update = async (id, setting) => {
    return await db('user_settings')
        .where({ id: id })
        .first()
        .update(setting)
        .returning('*');
};

const remove = async id => {
    return await db('user_settings').where({ id }).del();
};

module.exports = {
    findAll,
    findByUserId,
    findById,
    create,
    update,
    remove,
};
