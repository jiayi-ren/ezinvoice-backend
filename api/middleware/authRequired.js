const createError = require('http-errors');
const Users = require('../user/userModel');
const checkJwt = require('../middleware/checkJwt');

const makeUserObj = payload => {
    return {
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
        sub: payload.sub,
    };
};

const jwtVerification = async (req, res, next) => {
    return await checkJwt(req, res, next);
};

const jwtVerifiedUser = async (req, res, next) => {
    try {
        const jwtPayload = req.user;
        const jwtUserObject = makeUserObj(jwtPayload);
        const user = await Users.findOrCreateUser(jwtUserObject);
        if (user) {
            req.user = user;
        } else {
            throw new Error('Unable to process idToken');
        }
        next();
    } catch (err) {
        next(createError(401, err.message));
    }
};

const authRequired = [jwtVerification, jwtVerifiedUser];

module.exports = authRequired;
