const express = require('express');
const createError = require('http-errors');
const authRequired = require('../middleware/authRequired');
const router = express.Router();
const Businesses = require('./businessModel');
const algoliasearch = require('algoliasearch');
const client = algoliasearch(
    process.env.INSTANT_SEARCH_APPLICATION_ID,
    process.env.INSTANT_SEARCH_ADMIN_API_KEY,
);
const index = client.initIndex('businesses');
const knex = require('../../data/db-config');

/**
 * @swagger
 * components:
 *  parameters:
 *    Business:
 *      type: object
 *      properties:
 *        name:
 *          type: string
 *          description: The name of the business's business
 *          example: XYZ company
 *        email:
 *          type: string
 *          format: email
 *          description: The email of the business's business
 *          example: xyz@xyz.com
 *        street:
 *          type: string
 *          description: The street name of a address
 *          example: 123 xyz street
 *        city_state:
 *          type: string
 *          description: The city and state of a address
 *          example: City, State
 *        zip:
 *          type: string
 *          description: The zip code of a address
 *          example: '01234'
 *        phone:
 *          type: string
 *          format: phone
 *          description: The phone number of a business's business
 *          example: 123-234-3456
 *      example:
 *          name: XYZ company
 *          email: xyz@xyz.com
 *          street: 123 xyz street
 *          city_state: City, State
 *          zip: '01234'
 *          phone: 123-234-3456
 *  schemas:
 *    schemas:
 *    Business:
 *      type: object
 *      properties:
 *        id:
 *          type: integer
 *          description: The auto-generated id of the business
 *          example: 45
 *        name:
 *          type: string
 *          description: The name of the business's business
 *          example: XYZ company
 *        email:
 *          type: string
 *          format: email
 *          description: The email of the business's business
 *          example: xyz@xyz.com
 *        street:
 *          type: string
 *          description: The street name of a address
 *          example: 123 xyz street
 *        city_state:
 *          type: string
 *          description: The city and state of a address
 *          example: City, State
 *        zip:
 *          type: string
 *          description: The zip code of a address
 *          example: '01234'
 *        phone:
 *          type: string
 *          format: phone
 *          description: The phone number of a business's business
 *          example: 123-234-3456
 *        user_id:
 *          type: integer
 *          description: The user of the business belongs to
 *          example: 25
 *      example:
 *        id: 45
 *        name: XYZ company
 *        email: xyz@xyz.com
 *        street: 123 xyz street
 *        city_state: City, State
 *        zip: '01234'
 *        phone: 123-234-3456
 *        user_id: 25
 */

/**
 * @swagger
 *
 * /businesses:
 *  post:
 *    description: Create a business for auth user
 *    summary: Create a single business
 *    security:
 *      - auth0: ['bearer token']
 *    tags:
 *      - businesses
 *    parameters:
 *      - in: body
 *        name: Business object
 *        required: true
 *        schema:
 *          $ref: '#/components/parameters/Business'
 *    responses:
 *      200:
 *        description: A business object
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Business'
 *      401:
 *        $ref: '#/components/responses/UnauthorizedError'
 *      400:
 *        $ref: '#/components/responses/BadRequest'
 *      5XX:
 *        $ref: '#/components/responses/InternalServerError'
 */

router.post('/', authRequired, async (req, res, next) => {
    let businessReq = req.body;
    const authUserId = req.user.id;
    businessReq.user_id = authUserId;

    const trx = await knex.transaction();
    try {
        Businesses.findByEmail(businessReq.email)
            .then(business => {
                if (business) {
                    throw next(
                        createError(
                            409,
                            `Business with email ${businessReq.email} already exists`,
                            { expose: true },
                        ),
                    );
                }

                // add object to InstantSearch
                index
                    .saveObjects([businessReq], {
                        autoGenerateObjectIDIfNotExist: true,
                    })
                    .then(async ({ objectIDs }) => {
                        businessReq.id = objectIDs[0];
                        await Businesses.create(businessReq)
                            .then(async business => {
                                if (business) {
                                    return await Businesses.showBusiness(
                                        business[0].id,
                                    )
                                        .then(async business => {
                                            if (business) {
                                                trx.commit();
                                                return await res
                                                    .status(201)
                                                    .json({
                                                        message:
                                                            'Successfully create the business',
                                                        business: business[0],
                                                    });
                                            }
                                            throw next(500);
                                        })
                                        .catch(err => {
                                            index.deleteObject(businessReq.id);
                                            next(err);
                                        });
                                }
                                index.deleteObject(businessReq.id);
                                throw next(500);
                            })
                            .catch(err => {
                                throw next(err);
                            });
                    })
                    .catch(err => {
                        throw next(err);
                    });
            })
            .catch(err => {
                throw next(err);
            });
    } catch (err) {
        trx.rollback();
        throw next(err);
    }
});

/**
 * @swagger
 *
 * /businesses:
 *  get:
 *    description: get businesses of the current auth user
 *    summary: Returns an array of businesses
 *    security:
 *      - auth0: ['bearer token']
 *    tags:
 *      - businesses
 *    responses:
 *      200:
 *        description: An array of business objects
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                  $ref: '#/components/schemas/Business'
 *      401:
 *        $ref: '#/components/responses/UnauthorizedError'
 *      404:
 *        description: 'Businesses not found'
 *      5XX:
 *        $ref: '#/components/responses/InternalServerError'
 */

router.get('/', authRequired, (req, res, next) => {
    const authUserId = req.user.id;

    Businesses.findAllByUserId(authUserId)
        .then(businesses => {
            if (businesses.length >= 0) {
                return res.status(200).json(businesses);
            }
            next(
                createError(404, 'Businesses not found for current user', {
                    expose: true,
                }),
            );
        })
        .catch(err => next(err));
});

/**
 * @swagger
 *
 * /businesses/{business_id}:
 *  put:
 *    description: update a business for current auth user
 *    summary: Returns a single business
 *    security:
 *      - auth0: ['bearer token']
 *    tags:
 *      - businesses
 *    parameters:
 *      - in: body
 *        name: Business Object
 *        required: true
 *        schema:
 *            $ref: '#/components/schemas/Business'
 *    responses:
 *      200:
 *        description: 'Successfully updated businesses'
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Business'
 *      401:
 *        $ref: '#/components/responses/UnauthorizedError'
 *      404:
 *        description: 'Businesses not found'
 *      5XX:
 *        description: 'Internal Server Error'
 */

router.put('/:id', authRequired, async (req, res, next) => {
    const id = req.params.id;
    const businessReq = req.body;
    const authUserId = req.user.id;

    const trx = await knex.transaction();
    try {
        if (authUserId === businessReq.user_id) {
            return Businesses.findById(id)
                .then(async business => {
                    if (business) {
                        if (
                            business.id === id &&
                            business.id === businessReq.id
                        ) {
                            return await Businesses.update(id, businessReq)
                                .then(async ([updatedBusiness]) => {
                                    await index
                                        .partialUpdateObject({
                                            objectID: updatedBusiness.id,
                                            name: updatedBusiness.name,
                                            email: updatedBusiness.email,
                                            street: updatedBusiness.street,
                                            city_state:
                                                updatedBusiness.city_state,
                                            zip: updatedBusiness.zip,
                                            phone: updatedBusiness.phone,
                                        })
                                        .then(() => {
                                            trx.commit();
                                            return res.status(200).json({
                                                message: `Successfully updated business ${updatedBusiness.id}`,
                                                business: updatedBusiness,
                                            });
                                        })
                                        .catch(err => {
                                            throw next(err);
                                        });
                                })
                                .catch(err => {
                                    throw next(err);
                                });
                        }
                        throw next(
                            createError(
                                400,
                                'Business id doest not match with record',
                                { expose: true },
                            ),
                        );
                    }
                    throw next(
                        createError(
                            404,
                            'Business not found for current user',
                            {
                                expose: true,
                            },
                        ),
                    );
                })
                .catch(err => {
                    throw next(err);
                });
        }
        throw next(
            createError(401, 'Not authorized to complete this request', {
                expose: true,
            }),
        );
    } catch (err) {
        trx.rollback();
        throw next(err);
    }
});

/**
 * @swagger
 *
 * /businesses/{business_id}:
 *  delete:
 *    description: Delete business of current auth user
 *    summary: Delete a business
 *    security:
 *      - auth0: ['bearer token']
 *    tags:
 *      - businesses
 *    responses:
 *      200:
 *        description: 'Successfully deleted business'
 *      401:
 *        $ref: '#/components/responses/UnauthorizedError'
 *      404:
 *        description: 'Businesses not found'
 *      5XX:
 *        $ref: '#/components/responses/InternalServerError'
 */

router.delete('/:id', authRequired, async (req, res, next) => {
    const id = req.params.id;
    const authUserId = req.user.id;

    const trx = await knex.transaction();
    try {
        Businesses.findById(id)
            .then(async business => {
                if (business) {
                    if (business.user_id === authUserId) {
                        return await Businesses.remove(business.id)
                            .then(async () => {
                                await index
                                    .deleteObject(business.id)
                                    .then(() => {
                                        trx.commit();
                                        return res.status(200).json({
                                            message:
                                                'Successfully deleted the business',
                                        });
                                    })
                                    .catch(err => {
                                        throw next(err);
                                    });
                            })
                            .catch(err => {
                                throw next(err);
                            });
                    }
                    throw next(
                        createError(
                            401,
                            'Not authorized to complete this request',
                        ),
                        { expose: true },
                    );
                }
                throw next(
                    createError(404, 'Business not found', { expose: true }),
                );
            })
            .catch(err => {
                throw next(err);
            });
    } catch (err) {
        trx.rollback();
        throw next(err);
    }
});

module.exports = router;
