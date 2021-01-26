const express = require('express');
const authRequired = require('../middleware/authRequired');
const asyncMiddleWare = require('../middleware/asyncMiddleware');
const router = express.Router();
const Estimates = require('./estimateModel');
const Items = require('../items/itemModel');
const Businesses = require('../businesses/businessModel');
const Clients = require('../clients/clientModel');
const Users = require('../user/userModel');
const EstimateItems = require('../estimateItems/estimateItemsModel');

/**
 * @swagger
 * components:
 *  parameters:
 *    Estimate:
 *      type: object
 *      properties:
 *        title:
 *          type: string
 *          description: The title of the estimate
 *          example: Estimate
 *        date:
 *          type: string
 *          description: The date of the estimate
 *          example: '11/11/2020'
 *        doc_number:
 *          type: string
 *          description: The document number
 *          example: '1'
 *        business:
 *          type: object
 *          properties:
 *              name:
 *                type: string
 *                description: The name of the client's business
 *                example: XYZ company
 *              email:
 *                type: string
 *                format: email
 *                description: The email of the client's business
 *                example: xyz@xyz.com
 *              street:
 *                type: string
 *                description: The street name of a address
 *                example: 123 xyz street
 *              city_state:
 *                type: string
 *                description: The city and state of a address
 *                example: City, State
 *              zip:
 *                type: string
 *                description: The zip code of a address
 *                example: '01234'
 *              phone:
 *                type: string
 *                format: phone
 *                description: The phone number of a client's business
 *                example: 123-234-3456
 *        client:
 *          type: object
 *          properties:
 *              name:
 *                type: string
 *                description: The name of the client's client
 *                example: XYZ company
 *              email:
 *                type: string
 *                format: email
 *                description: The email of the client's client
 *                example: xyz@xyz.com
 *              street:
 *                type: string
 *                description: The street name of a address
 *                example: 123 xyz street
 *              city_state:
 *                type: string
 *                description: The city and state of a address
 *                example: City, State
 *              zip:
 *                type: string
 *                description: The zip code of a address
 *                example: '01234'
 *              phone:
 *                type: string
 *                format: phone
 *                description: The phone number of a client's client
 *                example: 123-234-3456
 *        items:
 *          type: array
 *          items:
 *            type: object
 *            properties:
 *              description:
 *                type: string
 *                description: The description of the estimate item
 *                example: 'estimate item 1'
 *              quantity:
 *                type: integer
 *                description: The quantity of the estimate item
 *                example: 3
 *              rate:
 *                type: double
 *                description: The unit price of the estimate item
 *                example: 50.00
 *  schemas:
 *    schemas:
 *    Estimate:
 *      type: object
 *      properties:
 *        id:
 *          type: integer
 *          description: The id of the estimate
 *          example: 45
 *        title:
 *          type: string
 *          description: The title of the estimate
 *          example: Estimate
 *        date:
 *          type: string
 *          description: The date of the estimate
 *          example: '11/11/2020'
 *        doc_number:
 *          type: string
 *          description: The document number
 *          example: '1'
 *        business:
 *          type: integer
 *          description: The business id of the business created estimate
 *          example: 24
 *        client:
 *          type: integer
 *          description: The business id of the business created estimate
 *          example: 25
 *        items:
 *          type: array
 *          items:
 *            type: object
 *            properties:
 *              id:
 *                type: integer
 *                description: The id of the estimate item
 *                example: 45
 *              description:
 *                type: string
 *                description: The description of the estimate item
 *                example: 'estimate item 1'
 *              quantity:
 *                type: integer
 *                description: The quantity of the estimate item
 *                example: 3
 *              rate:
 *                type: double
 *                description: The unit price of the estimate item
 *                example: 50.00
 */

/**
 * @swagger
 *
 * /estimates:
 *  post:
 *    description: Create a estimate for auth user
 *    summary: Create a single estimate
 *    security:
 *      - auth0: ['bearer token']
 *    tags:
 *      - estimates
 *    parameters:
 *      - in: body
 *        name: Estimate object
 *        required: true
 *        schema:
 *          $ref: '#/components/parameters/Estimate'
 *    responses:
 *      200:
 *        description: A estimate object
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Estimate'
 *      401:
 *        $ref: '#/components/responses/UnauthorizedError'
 *      400:
 *        $ref: '#/components/responses/BadRequest'
 *      5XX:
 *        $ref: '#/components/responses/InternalServerError'
 */

router.post(
    '/',
    authRequired,
    asyncMiddleWare(async (req, res, next) => {
        let estimateReq = req.body;
        const authUserId = req.user.id;
        estimateReq.user_id = authUserId;
        let itemsReq = estimateReq.items;
        let businessReq = estimateReq.business;
        let clientReq = estimateReq.client;
        let itemsRes = [];
        let businessRes, clientRes;
        let estimateRes = {};

        if (itemsReq.length > 0) {
            for (const itemReq of itemsReq) {
                const { quantity, ...item } = itemReq;
                item.user_id = authUserId;
                await Items.findOrCreateItem(item)
                    .then(item => {
                        if (item) {
                            itemsRes.push({
                                ...item,
                                quantity: itemReq.quantity,
                            });
                        } else {
                            next(500, 'Failed to create an item for the user', {
                                expose: true,
                            });
                        }
                    })
                    .catch(err => next(err));
            }
        }

        await Businesses.findOrCreateBusiness({
            ...businessReq,
            user_id: authUserId,
        })
            .then(business => {
                if (business) {
                    businessRes = business;
                } else {
                    next(500, 'Failed to create a business for the user', {
                        expose: true,
                    });
                }
            })
            .catch(err => next(err));

        await Clients.findOrCreateClient({ ...clientReq, user_id: authUserId })
            .then(client => {
                if (client) {
                    clientRes = client;
                } else {
                    next(500, 'Failed to create a client for the user', {
                        expose: true,
                    });
                }
            })
            .catch(err => next(err));

        await Users.findDocNumberById(authUserId)
            .then(async docNumber => {
                await Users.updateDocNumber(
                    authUserId,
                    parseInt(docNumber['doc_number']) + 1,
                )
                    .then(docNumber => {
                        docNumberRes = docNumber[0];
                    })
                    .catch(err => next(err));
            })
            .catch(err => next(err));

        await Estimates.create({
            title: estimateReq.title,
            doc_number: estimateReq.docNumber,
            user_id: estimateReq.user_id,
            business_id: businessRes.id,
            client_id: clientRes.id,
            date: estimateReq.date,
        })
            .then(estimate => {
                if (estimate) {
                    Object.assign(estimateRes, estimate[0]);
                    estimateRes.items = [];
                } else {
                    next(500, 'Failed to create an estimate for the user', {
                        expose: true,
                    });
                }
            })
            .catch(err => next(err));

        for (const item of itemsRes) {
            await EstimateItems.create({
                estimate_id: estimateRes.id,
                item_id: item.id,
                quantity: item.quantity,
            })
                .then(estimateItem => {
                    if (estimateItem) {
                        estimateRes.items.push(item);
                    } else {
                        next(
                            500,
                            `Failed to create a relationship between estimate ${estimateRes.id} and item ${item.id} for the user`,
                            { expose: true },
                        );
                    }
                })
                .catch(err => next(err));
        }

        estimateRes.business = businessRes;
        estimateRes.client = clientRes;

        if (estimateRes) {
            res.status(201).json({
                estimate: estimateRes,
            });
        }
    }),
);

/**
 * @swagger
 *
 * /estimates:
 *  get:
 *    description: get estimates of the current auth user
 *    summary: Returns an array of estimates
 *    security:
 *      - auth0: ['bearer token']
 *    tags:
 *      - estimates
 *    responses:
 *      200:
 *        description: An array of estimate objects
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              estimates:
 *                  $ref: '#/components/schemas/Estimate'
 *      401:
 *        $ref: '#/components/responses/UnauthorizedError'
 *      404:
 *        description: 'Estimates not found'
 *      5XX:
 *        $ref: '#/components/responses/InternalServerError'
 */

router.get(
    '/',
    authRequired,
    asyncMiddleWare(async (req, res, next) => {
        const authUserId = req.user.id;
        let estimatesRes = [];

        await Estimates.findAllByUserId(authUserId)
            .then(estimates => {
                if (!estimates) {
                    next(404, 'Estimates not found for current user', {
                        expose: true,
                    });
                } else {
                    estimatesRes = [...estimates];
                }
            })
            .catch(err => next(err));

        for (let estimate of estimatesRes) {
            // find each item associated
            estimate.items = [];
            const items = await EstimateItems.findByEstimateId(estimate.id);
            for (let item of items) {
                const itemRes = await Items.findById(item.item_id);
                estimate.items.push({
                    ...itemRes,
                    quantity: item.quantity,
                });
            }

            const business = await Businesses.findById(estimate.business_id);
            estimate.business = business;
            const client = await Clients.findById(estimate.client_id);
            estimate.client = client;

            // format date, yyyy-mm-dd
            estimate.date = estimate.date.toISOString().substring(0, 10);
        }

        if (estimatesRes) {
            res.status(200).json(estimatesRes);
        }
    }),
);

/**
 * @swagger
 *
 * /estimates/{estimate_id}:
 *  put:
 *    description: update a estimate for current auth user
 *    summary: Returns a single estimate
 *    security:
 *      - auth0: ['bearer token']
 *    tags:
 *      - estimates
 *    parameters:
 *      - in: body
 *        name: Estimate Object
 *        required: true
 *        schema:
 *            $ref: '#/components/schemas/Estimate'
 *    responses:
 *      200:
 *        description: 'Successfully updated Estimate'
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Estimate'
 *      400:
 *        description: 'Bad Request'
 *      401:
 *        $ref: '#/components/responses/UnauthorizedError'
 *      404:
 *        description: 'Estimate not found'
 *      5XX:
 *        description: 'Internal Server Error'
 */

router.put(
    '/:id',
    authRequired,
    asyncMiddleWare(async (req, res, next) => {
        const id = req.params.id;
        const { items, business, client, ...estimateReq } = req.body;
        const authUserId = req.user.id;
        let estimateRes = { items: [] };

        if (estimateReq.id !== id) {
            next(400, 'Estimate id doest not match with parameter id', {
                expose: true,
            });
        }

        await Estimates.findById(id)
            .then(async estimate => {
                if (!estimate) {
                    next(404, `Estimate ${id} not found`);
                } else if (estimate.user_id !== authUserId) {
                    next(
                        401,
                        `Not Authorized to make changes to Estimate ${estimate.id}`,
                        { expose: true },
                    );
                } else if (
                    estimate.id === id &&
                    estimate.user_id === authUserId
                ) {
                    for (const itemReq of items) {
                        if (itemReq.id) {
                            await Items.findById(itemReq.id)
                                .then(async item => {
                                    if (item) {
                                        const {
                                            quantity,
                                            createdAt,
                                            updatedAt,
                                            ...updateItem
                                        } = itemReq;
                                        await Items.update(item.id, updateItem)
                                            .then(async item => {
                                                estimateRes.items.push(item[0]);
                                            })
                                            .catch(err => next(err));
                                    } else {
                                        next(404, 'Item id not found', {
                                            expose: true,
                                        });
                                    }
                                })
                                .catch(err => next(err));
                        } else {
                            const { quantity, ...newItem } = itemReq;
                            await Items.create({
                                ...newItem,
                                user_id: authUserId,
                            })
                                .then(async item => {
                                    estimateRes.items.push(item[0]);
                                })
                                .catch(err => next(err));
                        }
                    }

                    for (let i = 0; i < estimateRes.items.length; i++) {
                        await EstimateItems.findByItemId(
                            estimateRes.items[i].id,
                        )
                            .then(async estimateItem => {
                                if (estimateItem) {
                                    const { quantity, ...updateItem } = items[
                                        i
                                    ];
                                    await EstimateItems.update(
                                        estimateItem.estimate_id,
                                        estimateItem.item_id,
                                        {
                                            quantity: quantity,
                                        },
                                    )
                                        .then(estimateItem => {
                                            estimateRes.items[i] = {
                                                ...estimateRes.items[i],
                                                quantity:
                                                    estimateItem[0].quantity,
                                            };
                                        })
                                        .catch(err => next(err));
                                } else {
                                    const { quantity, ...updateItem } = items[
                                        i
                                    ];
                                    await EstimateItems.create({
                                        estimate_id: estimateReq.id,
                                        item_id: estimateRes.items[i].id,
                                        quantity: quantity,
                                    })
                                        .then(estimateItem => {
                                            estimateRes.items[i] = {
                                                ...estimateRes.items[i],
                                                quantity:
                                                    estimateItem[0].quantity,
                                            };
                                        })
                                        .catch(err => next(err));
                                }
                            })
                            .catch(err => next(err));
                    }

                    await Businesses.update(estimateReq.business_id, business)
                        .then(business => {
                            estimateRes.business = business;
                        })
                        .catch(err => next(err));

                    await Clients.update(estimateReq.client_id, client)
                        .then(client => {
                            estimateRes.client = client;
                        })
                        .catch(err => next(err));

                    await Estimates.update(id, estimateReq)
                        .then(estimate => {
                            Object.assign(estimateRes, estimate[0]);
                        })
                        .catch(err => next(err));
                }
            })
            .catch(err => next(err));

        res.status(200).json({
            message: `Successfully updated estimate ${estimateRes.id}`,
            estimate: estimateRes,
        });
    }),
);

/**
 * @swagger
 *
 * /estimates/{estimate_id}:
 *  delete:
 *    description: Delete estimate of current auth user
 *    summary: Delete an estimate
 *    security:
 *      - auth0: ['bearer token']
 *    tags:
 *      - estimates
 *    responses:
 *      200:
 *        description: 'Successfully deleted estimate'
 *      401:
 *        $ref: '#/components/responses/UnauthorizedError'
 *      404:
 *        description: 'Estimate not found'
 *      5XX:
 *        $ref: '#/components/responses/InternalServerError'
 */

router.delete(
    '/:id',
    authRequired,
    asyncMiddleWare(async (req, res, next) => {
        const id = req.params.id;
        const authUserId = req.user.id;

        await Estimates.findById(id)
            .then(async estimate => {
                if (!estimate) {
                    next(404, `Estimate ${id} not found`, { expose: true });
                } else if (estimate.user_id !== authUserId) {
                    next(
                        401,
                        `Not authorized to make changes to Estimate ${id}`,
                        { expose: true },
                    );
                } else if (estimate.user_id === authUserId) {
                    await Estimates.remove(id)
                        .then(() => {
                            res.status(200).json({
                                message: `Successfully deleted Estimate ${id}`,
                            });
                        })
                        .catch(err => next(err));
                }
            })
            .catch(err => next(err));
    }),
);

module.exports = router;
