const db = require('../../data/db-config');

const findAll = async () => {
    return await db('users');
}

const findById = async (id) => {
    return await db('users').where({ id }).first().select('*');
}

const create = async (user) => {
    return await db('users').insert(user).returning('*');
}

const findOrCreateUser = async (userObj) => {
    const foundUser = await findById(userObj.id).then((user) => user);
    if (foundUser) {
        return foundUser;
    } else {
        return await create(userObj)
            .then((newUser) => {
            return newUser ? newUser[0] : newUser;
            });
    }
}

module.exports = {
    findAll,
    findById,
    create,
    findOrCreateUser
}