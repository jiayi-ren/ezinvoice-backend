const express = require('express');
const authRequired = require('../middleware/authRequired');
const router = express.Router();
const Items = require('./itemModel');

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

router.post('/', authRequired, (req, res) => {
    let itemReq = req.body;
    const authUserId = req.user.id;
    itemReq.user_id = authUserId;

    Items.findByDescription(itemReq.description)
        .then(item => {
            if (item) {
                return res.status(409).json({
                    error: `Item with description ${itemReq.description} already exists`,
                });
            }
            Items.create(itemReq)
                .then(item => {
                    if (item) {
                        return res.status(200).json({
                            message: 'Successfully create the item',
                            item: item[0],
                        });
                    }
                    res.status(500).json({
                        error: 'Failed to create a item for the user',
                    });
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({ error: err.message });
                });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err.message });
        });
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
            res.status(404).json({
                error: 'Items not found for current user',
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err.message });
        });
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

router.put('/:id', authRequired, (req, res) => {
    const id = req.params.id;
    const itemReq = req.body;
    const authUserId = req.user.id;

    if (authUserId === itemReq.user_id) {
        return Items.findById(id)
            .then(item => {
                if (item) {
                    if (item.id === id && item.id === itemReq.id) {
                        return Items.update(id, itemReq)
                            .then(updated => {
                                res.status(200).json({
                                    message: `Successfully updated item ${item.id}`,
                                    item: updated[0],
                                });
                            })
                            .catch(err => {
                                res.status(500).json({
                                    message: `Failed to update item ${item.id}`,
                                    error: err.message,
                                });
                            });
                    }
                    return res.status(400).json({
                        error: 'Item id doest not match with record',
                    });
                }
                res.status(404).json({
                    error: 'Item not found for current user',
                });
            })
            .catch(err => {
                res.status(500).json({ error: err.message });
            });
    }
    res.status(401).json({ error: 'Not authorized to complete this request' });
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

router.delete('/:id', authRequired, (req, res) => {
    const id = req.params.id;
    const authUserId = req.user.id;

    Items.findById(id)
        .then(item => {
            if (item) {
                if (item.user_id === authUserId) {
                    return Items.remove(item.id)
                        .then(() => {
                            res.status(200).json({
                                message: 'Successfully deleted the item',
                            });
                        })
                        .catch(err => {
                            console.log(err);
                            res.status(500).json({ error: err.message });
                        });
                }
                return res
                    .status(401)
                    .json({ error: 'Not authorized to complete this request' });
            }
            res.status(404).json({ error: 'Item not found' });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err.message });
        });
});

module.exports = router;
