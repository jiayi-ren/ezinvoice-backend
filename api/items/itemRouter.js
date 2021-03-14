const express = require('express');
const createError = require('http-errors');
const authRequired = require('../middleware/authRequired');
const router = express.Router();
const Items = require('./itemModel');
const algoliasearch = require('algoliasearch');
const client = algoliasearch(
    process.env.INSTANT_SEARCH_APPLICATION_ID,
    process.env.INSTANT_SEARCH_ADMIN_API_KEY,
);
const index = client.initIndex('items');
const knex = require('../../data/db-config');

/**
 * @swagger
 * components:
 *  parameters:
 *    Item:
 *      type: object
 *      properties:
 *        description:
 *          type: string
 *          description: The description of the item
 *          example: some items
 *        rate:
 *          type: number
 *          format: float
 *          description: The rate of the item
 *          example: 20.00
 *      example:
 *          description: some items
 *          rate: 20.00

 *  schemas:
 *    schemas:
 *    Item:
 *      type: object
 *      properties:
 *        id:
 *          type: integer
 *          description: The auto-generated id of the item
 *          example: 55
 *        description:
 *          type: string
 *          description: The description of the item
 *          example: some items
 *        rate:
 *          type: number
 *          format: float
 *          description: The rate of the item
 *          example: 20.00
 *        user_id:
 *          type: integer
 *          description: The user of the item belongs to
 *          example: 25
 *      example:
 *        id: 55
 *        description: some items
 *        rate: 20.00
 *        user_id: 25
 */

/**
 * @swagger
 *
 * /items:
 *  post:
 *    description: Create a item for auth user
 *    summary: Create a single item
 *    security:
 *      - auth0: ['bearer token']
 *    tags:
 *      - items
 *    parameters:
 *      - in: body
 *        name: Item object
 *        required: true
 *        schema:
 *          $ref: '#/components/parameters/Item'
 *    responses:
 *      200:
 *        description: A item object
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Item'
 *      401:
 *        $ref: '#/components/responses/UnauthorizedError'
 *      400:
 *        $ref: '#/components/responses/BadRequest'
 *      5XX:
 *        $ref: '#/components/responses/InternalServerError'
 */

router.post('/', authRequired, async (req, res, next) => {
    let itemReq = req.body;
    const authUserId = req.user.id;
    itemReq.user_id = authUserId;

    const trx = await knex.transaction();
    try {
        Items.findByDescription(itemReq.description)
            .then(item => {
                if (item) {
                    next(
                        createError(
                            409,
                            `Item with description ${itemReq.description} already exists`,
                            { expose: true },
                        ),
                    );
                }
                index
                    .saveObjects([itemReq], {
                        autoGenerateObjectIDIfNotExist: true,
                    })
                    .then(async ({ objectIDs }) => {
                        itemReq.id = objectIDs[0];
                        await Items.create(itemReq)
                            .then(async item => {
                                if (item) {
                                    return await Items.showItem(item[0].id)
                                        .then(async item => {
                                            if (item) {
                                                trx.commit();
                                                return await res
                                                    .status(201)
                                                    .json({
                                                        message:
                                                            'Successfully create the item',
                                                        item: item[0],
                                                    });
                                            }
                                            throw next(500);
                                        })
                                        .catch(err => {
                                            index.deleteObject(itemReq.id);
                                            throw next(err);
                                        });
                                }
                                index.deleteObject(itemReq.id);
                                throw next(500);
                            })
                            .catch(err => {
                                index.deleteObject(itemReq.id);
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
 * /items:
 *  get:
 *    description: get items of the current auth user
 *    summary: Returns an array of items
 *    security:
 *      - auth0: ['bearer token']
 *    tags:
 *      - items
 *    responses:
 *      200:
 *        description: An array of item objects
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                  $ref: '#/components/schemas/Item'
 *      401:
 *        $ref: '#/components/responses/UnauthorizedError'
 *      404:
 *        description: 'Items not found'
 *      5XX:
 *        $ref: '#/components/responses/InternalServerError'
 */

router.get('/', authRequired, (req, res) => {
    const authUserId = req.user.id;

    Items.findAllByUserId(authUserId)
        .then(items => {
            if (items) {
                return res.status(200).json(items);
            }
            next(
                createError(404, 'Items not found for current user', {
                    expose: true,
                }),
            );
        })
        .catch(err => next(err));
});

/**
 * @swagger
 *
 * /items/{item_id}:
 *  put:
 *    description: update a item for current auth user
 *    summary: Returns a single item
 *    security:
 *      - auth0: ['bearer token']
 *    tags:
 *      - items
 *    parameters:
 *      - in: body
 *        name: Item Object
 *        required: true
 *        schema:
 *            $ref: '#/components/schemas/Item'
 *    responses:
 *      200:
 *        description: 'Successfully updated item'
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Item'
 *      401:
 *        $ref: '#/components/responses/UnauthorizedError'
 *      404:
 *        description: 'Item not found'
 *      5XX:
 *        description: 'Internal Server Error'
 */

router.put('/:id', authRequired, async (req, res, next) => {
    const id = req.params.id;
    const itemReq = req.body;
    const authUserId = req.user.id;

    const trx = await knex.transaction();
    try {
        if (authUserId === itemReq.user_id) {
            return Items.findById(id)
                .then(async item => {
                    if (item) {
                        if (item.id === id && item.id === itemReq.id) {
                            return Items.update(id, itemReq)
                                .then(async ([updatedItem]) => {
                                    await index
                                        .partialUpdateObject({
                                            objectID: updatedItem.id,
                                            description:
                                                updatedItem.description,
                                            rate: updatedItem.rate,
                                        })
                                        .then(() => {
                                            trx.commit();
                                            return res.status(200).json({
                                                message: `Successfully updatedItem item ${updatedItem.id}`,
                                                item: updatedItem,
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
                                'Item id doest not match with record',
                                {
                                    expose: true,
                                },
                            ),
                        );
                    }
                    throw next(
                        createError(404, 'Item not found for current user', {
                            expose: true,
                        }),
                    );
                })
                .catch(err => {
                    throw next(err);
                });
        }
        throw next(
            (401, 'Not authorized to complete this request', { expose: true }),
        );
    } catch (err) {
        trx.rollback();
        throw next(err);
    }
});

/**
 * @swagger
 *
 * /items/{item_id}:
 *  delete:
 *    description: Delete item of current auth user
 *    summary: Delete an item
 *    security:
 *      - auth0: ['bearer token']
 *    tags:
 *      - items
 *    responses:
 *      200:
 *        description: 'Successfully deleted item'
 *      401:
 *        $ref: '#/components/responses/UnauthorizedError'
 *      404:
 *        description: 'Item not found'
 *      5XX:
 *        $ref: '#/components/responses/InternalServerError'
 */

router.delete('/:id', authRequired, (req, res, next) => {
    const id = req.params.id;
    const authUserId = req.user.id;

    Items.findById(id)
        .then(async item => {
            if (item) {
                if (item.user_id === authUserId) {
                    return await Items.remove(item.id)
                        .then(async () => {
                            await index
                                .deleteObject(item.id)
                                .then(() => {
                                    res.status(200).json({
                                        message:
                                            'Successfully deleted the item',
                                    });
                                })
                                .catch(err => next(err));
                        })
                        .catch(err => next(err));
                }
                next(
                    createError(
                        401,
                        'Not authorized to complete this request',
                        {
                            expose: true,
                        },
                    ),
                );
            }
            next(createError(404, 'Item not found', { expose: true }));
        })
        .catch(err => next(err));
});

module.exports = router;
