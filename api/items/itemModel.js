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
    const timestamp = Date.now().toString();
    const itemData = item.id ? item : { ...item, id: `_${timestamp}` };
    return await db('items').insert(itemData).returning('*');
};

const update = async (id, item) => {
    return await db('items').where({ id }).first().update(item).returning('*');
};

const remove = async id => {
    return await db('items').where({ id }).del();
};

const findOrCreateItem = async item => {
    const foundItem = await findByDescription(item.description).then(
        item => item,
    );
    if (foundItem) {
        return foundItem;
    } else {
        return await create(item).then(newItem => {
            return newItem ? newItem[0] : newItem;
        });
    }
};

const showItem = async id => {
    return await db('items')
        .where({ id })
        .first()
        .update('is_hidden', false)
        .returning('*');
};

module.exports = {
    findAll,
    findById,
    findByDescription,
    findAllByUserId,
    create,
    update,
    remove,
    findOrCreateItem,
    showItem,
};
