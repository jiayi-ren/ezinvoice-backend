const express = require('express');
const authRequired = require('../middleware/authRequired');
const router = express.Router();
const Clients = require('./clientModel');

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

router.post('/', authRequired, (req, res) => {
    let clientReq = req.body;
    const authUserId = req.user.id;
    clientReq.user_id = authUserId;

    if (!clientReq.email) {
        return res.status(400).json({ error: 'Client email required' });
    }

    Clients.findByEmail(clientReq.email)
        .then(client => {
            if (client) {
                return res.status(409).json({
                    error: `Client with email ${clientReq.email} already exists`,
                });
            }
            Clients.create(clientReq)
                .then(client => {
                    if (client) {
                        return res.status(201).json({
                            message: 'Successfully create the client',
                            client: client[0],
                        });
                    }
                    res.status(500).json({
                        error: 'Failed to create a client for the user',
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

router.get('/', authRequired, (req, res) => {
    const authUserId = req.user.id;

    Clients.findAllByUserId(authUserId)
        .then(clients => {
            if (clients) {
                return res.status(200).json(clients);
            }
            res.status(404).json({
                error: 'Clients not found for current user',
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

router.put('/:id', authRequired, (req, res) => {
    const id = req.params.id;
    const clientReq = req.body;
    const authUserId = req.user.id;

    if (authUserId === clientReq.user_id) {
        return Clients.findById(id)
            .then(client => {
                if (client) {
                    if (client.id === id && client.id === clientReq.id) {
                        return Clients.update(id, clientReq)
                            .then(updated => {
                                res.status(200).json({
                                    message: `Successfully updated client ${client.id}`,
                                    client: updated[0],
                                });
                            })
                            .catch(err => {
                                res.status(500).json({
                                    message: `Failed to update client ${client.id}`,
                                    error: err.message,
                                });
                            });
                    }
                    return res.status(400).json({
                        error: 'Client id doest not match with record',
                    });
                }
                res.status(404).json({
                    error: 'Client not found for current user',
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

router.delete('/:id', authRequired, (req, res) => {
    const id = req.params.id;
    const authUserId = req.user.id;

    Clients.findById(id)
        .then(client => {
            if (client) {
                if (client.user_id === authUserId) {
                    return Clients.remove(client.id)
                        .then(() => {
                            res.status(200).json({
                                message: 'Successfully deleted the client',
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
            res.status(404).json({ error: 'Client not found' });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err.message });
        });
});

module.exports = router;
