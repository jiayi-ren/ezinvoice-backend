const db = require('../../data/db-config');

const findAll = async () => {
    return await db('businesses').select('*');
};

const findById = async id => {
    return await db('businesses').where({ id }).first();
};

const findByEmail = async email => {
    return await db('businesses').where({ email: email }).first().select('*');
};

const findAllByUserId = async user_id => {
    return await db('businesses').where({ user_id: user_id }).select('*');
};

const create = async business => {
    const timestamp = Date.now().toString();
    const businessData = business.id
        ? business
        : { ...business, id: `_${timestamp}` };
    return await db('businesses').insert(businessData).returning('*');
};

const update = async (id, business) => {
    return await db('businesses')
        .where({ id })
        .first()
        .update(business)
        .returning('*');
};

const remove = async id => {
    return await db('businesses').where({ id }).del();
};

const findOrCreateBusiness = async business => {
    const foundBusiness = await findByEmail(business.email).then(
        business => business,
    );
    if (foundBusiness) {
        return foundBusiness;
    } else {
        return await create(business).then(newBusiness => {
            return newBusiness ? newBusiness[0] : newBusiness;
        });
    }
};

const showBusiness = async id => {
    return await db('businesses')
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
    findOrCreateBusiness,
    showBusiness,
};
