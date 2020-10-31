const createError = require('http-errors');
const Profiles = require('../user/userModel');
const checkJwt = require('../middleware/checkJwt');

const makeUserObj = (payload) => {
    return {
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
    }
}

const jwtVerification = async (req, res, next) => {
    return await checkJwt(req, res, next);
}

const jwtVerifiedUser = async (req, res, next) => {
    try {
        const jwtPayload = req.user;
        const jwtUserObject = makeUserObj(jwtPayload);
        const user = await Profiles.findOrCreateUser(jwtUserObject);
        if (user) {
            req.user = user;
        } else {
            throw new Error("Unable to process idToken")
        }
        next();
    } catch (err)  {
        next(createError(401, err.message));
    }
}

const authRequired = [jwtVerification, jwtVerifiedUser]

module.exports = authRequired;