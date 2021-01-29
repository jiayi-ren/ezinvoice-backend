const db = require('../../data/db-config');

const findAll = async () => {
    return await db('clients').select('*');
};

const findById = async id => {
    return await db('clients').where({ id }).first();
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

const findOrCreateClient = async client => {
    const foundClient = await findByEmail(client.email).then(client => client);
    if (foundClient) {
        return foundClient;
    } else {
        return await create(client).then(newClient => {
            return newClient ? newClient[0] : newClient;
        });
    }
};

const showClient = async id => {
    return await db('clients')
        .where({ id })
        .first()
        .update('is_hidden', false)
        .returning('*');
};

module.exports = {
    findAll,
    findById,
    findByEmail,
    findAllByUserId,
    create,
    update,
    remove,
    findOrCreateClient,
    showClient,
};
