const express = require('express');
const createError = require('http-errors');
const authRequired = require('../middleware/authRequired');
const router = express.Router();
const Clients = require('./clientModel');
const algoliasearch = require('algoliasearch');
const client = algoliasearch(
    process.env.INSTANT_SEARCH_APPLICATION_ID,
    process.env.INSTANT_SEARCH_ADMIN_API_KEY,
);
const index = client.initIndex('clients');
const knex = require('../../data/db-config');

/**
 * @swagger
 * components:
 *  parameters:
 *    Client:
 *      type: object
 *      properties:
 *        name:
 *          type: string
 *          description: The name of the client's business
 *          example: XYZ company
 *        email:
 *          type: string
 *          format: email
 *          description: The email of the client's business
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
 *          description: The phone number of a client's business
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
 *    Client:
 *      type: object
 *      properties:
 *        id:
 *          type: integer
 *          description: The auto-generated id of the client
 *          example: 45
 *        name:
 *          type: string
 *          description: The name of the client's business
 *          example: XYZ company
 *        email:
 *          type: string
 *          format: email
 *          description: The email of the client's business
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
 *          description: The phone number of a client's business
 *          example: 123-234-3456
 *        user_id:
 *          type: integer
 *          description: The user of the client belongs to
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
 * /clients:
 *  post:
 *    description: Create a client for auth user
 *    summary: Create a single client
 *    security:
 *      - auth0: ['bearer token']
 *    tags:
 *      - clients
 *    parameters:
 *      - in: body
 *        name: Client object
 *        required: true
 *        schema:
 *          $ref: '#/components/parameters/Client'
 *    responses:
 *      200:
 *        description: A client object
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Client'
 *      401:
 *        $ref: '#/components/responses/UnauthorizedError'
 *      400:
 *        $ref: '#/components/responses/BadRequest'
 *      5XX:
 *        $ref: '#/components/responses/InternalServerError'
 */

router.post('/', authRequired, async (req, res, next) => {
    let clientReq = req.body;
    const authUserId = req.user.id;
    clientReq.user_id = authUserId;

    const trx = await knex.transaction();
    try {
        Clients.findByEmail(clientReq.email)
            .then(client => {
                if (client) {
                    throw next(
                        createError(
                            409,
                            `Client with email ${clientReq.email} already exists`,
                            { expose: true },
                        ),
                    );
                }

                // add object to InstantSearch
                index
                    .saveObjects([clientReq], {
                        autoGenerateObjectIDIfNotExist: true,
                    })
                    .then(async ({ objectIDs }) => {
                        clientReq.id = objectIDs[0];
                        await Clients.create(clientReq)
                            .then(async client => {
                                if (client) {
                                    return await Clients.showClient(
                                        client[0].id,
                                    )
                                        .then(async client => {
                                            if (client) {
                                                trx.commit();
                                                return await res
                                                    .status(201)
                                                    .json({
                                                        message:
                                                            'Successfully create the client',
                                                        client: client[0],
                                                    });
                                            }
                                            throw next(500);
                                        })
                                        .catch(err => {
                                            index.deleteObject(clientReq.id);
                                            throw next(err);
                                        });
                                }
                                index.deleteObject(clientReq.id);
                                throw next(500);
                            })
                            .catch(err => {
                                index.deleteObject(clientReq.id);
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
 * /clients:
 *  get:
 *    description: get clients of the current auth user
 *    summary: Returns an array of clients
 *    security:
 *      - auth0: ['bearer token']
 *    tags:
 *      - clients
 *    responses:
 *      200:
 *        description: An array of client objects
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                  $ref: '#/components/schemas/Client'
 *      401:
 *        $ref: '#/components/responses/UnauthorizedError'
 *      404:
 *        description: 'Clients not found'
 *      5XX:
 *        $ref: '#/components/responses/InternalServerError'
 */

router.get('/', authRequired, (req, res, next) => {
    const authUserId = req.user.id;

    Clients.findAllByUserId(authUserId)
        .then(clients => {
            if (clients) {
                return res.status(200).json(clients);
            }
            next(
                createError(404, 'Clients not found for current user', {
                    expose: true,
                }),
            );
        })
        .catch(err => next(err));
});

/**
 * @swagger
 *
 * /clients/{client_id}:
 *  put:
 *    description: update a client for current auth user
 *    summary: Returns a single client
 *    security:
 *      - auth0: ['bearer token']
 *    tags:
 *      - clients
 *    parameters:
 *      - in: body
 *        name: Client Object
 *        required: true
 *        schema:
 *            $ref: '#/components/schemas/Client'
 *    responses:
 *      200:
 *        description: 'Successfully updated clients'
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Client'
 *      401:
 *        $ref: '#/components/responses/UnauthorizedError'
 *      404:
 *        description: 'Clients not found'
 *      5XX:
 *        description: 'Internal Server Error'
 */

router.put('/:id', authRequired, async (req, res, next) => {
    const id = req.params.id;
    const clientReq = req.body;
    const authUserId = req.user.id;

    const trx = await knex.transaction();
    try {
        if (authUserId === clientReq.user_id) {
            return Clients.findById(id)
                .then(async client => {
                    if (client) {
                        if (client.id === id && client.id === clientReq.id) {
                            return await Clients.update(id, clientReq)
                                .then(async ([updatedClient]) => {
                                    await index
                                        .partialUpdateObject({
                                            objectID: updatedClient.id,
                                            name: updatedClient.name,
                                            email: updatedClient.email,
                                            street: updatedClient.street,
                                            city_state:
                                                updatedClient.city_state,
                                            zip: updatedClient.zip,
                                            phone: updatedClient.phone,
                                        })
                                        .then(() => {
                                            trx.commit();
                                            return res.status(200).json({
                                                message: `Successfully updated client ${client.id}`,
                                                client: updatedClient,
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
                                'Client id doest not match with record',
                                {
                                    expose: true,
                                },
                            ),
                        );
                    }
                    throw next(
                        createError(404, 'Client not found for current user', {
                            expose: true,
                        }),
                    );
                })
                .catch(err => {
                    throw next(err);
                });
        }
        throw next(401, 'Not authorized to complete this request');
    } catch (err) {
        trx.rollback();
        throw next(err);
    }
});

/**
 * @swagger
 *
 * /clients/{client_id}:
 *  delete:
 *    description: Delete client of current auth user
 *    summary: Delete a client
 *    security:
 *      - auth0: ['bearer token']
 *    tags:
 *      - clients
 *    responses:
 *      200:
 *        description: 'Successfully deleted client'
 *      401:
 *        $ref: '#/components/responses/UnauthorizedError'
 *      404:
 *        description: 'Clients not found'
 *      5XX:
 *        $ref: '#/components/responses/InternalServerError'
 */

router.delete('/:id', authRequired, async (req, res, next) => {
    const id = req.params.id;
    const authUserId = req.user.id;

    const trx = await knex.transaction();
    try {
        Clients.findById(id)
            .then(async client => {
                if (client) {
                    if (client.user_id === authUserId) {
                        return await Clients.remove(client.id)
                            .then(async () => {
                                await index
                                    .deleteObject(client.id)
                                    .then(() => {
                                        trx.commit();
                                        return res.status(200).json({
                                            message:
                                                'Successfully deleted the client',
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
                            {
                                expose: true,
                            },
                        ),
                    );
                }
                throw next(
                    createError(404, 'Client not found', { expose: true }),
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
