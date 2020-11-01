const db = require('../../data/db-config');

const findAll = async () => {
    return await db('users');
};

const findById = async id => {
    return await db('users').where({ id }).first().select('*');
};

const findByEmail = async email => {
    return await db('users').where({ email: email }).first().select('*');
};

const findBySub = async sub => {
    return await db('users').where({ sub: sub }).first().select('*');
};

const create = async user => {
    return await db('users').insert(user).returning('*');
};

const update = async (id, user) => {
    return await db('users')
        .where({ id: id })
        .first()
        .update(user)
        .returning('*');
};

const remove = async id => {
    return await db('users').where({ id }).del();
};

const findOrCreateUser = async userObj => {
    const foundUser = await findBySub(userObj.sub).then(user => user);
    if (foundUser) {
        return foundUser;
    } else {
        return await create(userObj).then(newUser => {
            return newUser ? newUser[0] : newUser;
        });
    }
};

module.exports = {
    findAll,
    findById,
    findByEmail,
    findBySub,
    create,
    update,
    remove,
    findOrCreateUser,
};
