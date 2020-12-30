const express = require('express');
const authRequired = require('../middleware/authRequired');
const asyncMiddleWare = require('../middleware/asyncMiddleware');
const router = express.Router();
const Invoices = require('./invoiceModel');
const Items = require('../items/itemModel');
const Businesses = require('../businesses/businessModel');
const Clients = require('../clients/clientModel');
const Users = require('../user/userModel');
const InvoiceItems = require('../invoiceItems/invoiceItemsModel');

/**
 * @swagger
 * components:
 *  parameters:
 *    Invoice:
 *      type: object
 *      properties:
 *        title:
 *          type: string
 *          description: The title of the invoice
 *          example: Invoice
 *        date:
 *          type: string
 *          description: The date of the invoice
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
 *                description: The description of the invoice item
 *                example: 'invoice item 1'
 *              quantity:
 *                type: integer
 *                description: The quantity of the invoice item
 *                example: 3
 *              rate:
 *                type: double
 *                description: The unit price of the invoice item
 *                example: 50.00
 *  schemas:
 *    schemas:
 *    Invoice:
 *      type: object
 *      properties:
 *        id:
 *          type: integer
 *          description: The id of the invoice
 *          example: 45
 *        title:
 *          type: string
 *          description: The title of the invoice
 *          example: Invoice
 *        date:
 *          type: string
 *          description: The date of the invoice
 *          example: '11/11/2020'
 *        doc_number:
 *          type: string
 *          description: The document number
 *          example: '1'
 *        business:
 *          type: integer
 *          description: The business id of the business created invoice
 *          example: 24
 *        client:
 *          type: integer
 *          description: The business id of the business created invoice
 *          example: 25
 *        items:
 *          type: array
 *          items:
 *            type: object
 *            properties:
 *              id:
 *                type: integer
 *                description: The id of the invoice item
 *                example: 45
 *              description:
 *                type: string
 *                description: The description of the invoice item
 *                example: 'invoice item 1'
 *              quantity:
 *                type: integer
 *                description: The quantity of the invoice item
 *                example: 3
 *              rate:
 *                type: double
 *                description: The unit price of the invoice item
 *                example: 50.00
 */

/**
 * @swagger
 *
 * /invoices:
 *  post:
 *    description: Create a invoice for auth user
 *    summary: Create a single invoice
 *    security:
 *      - auth0: ['bearer token']
 *    tags:
 *      - invoices
 *    parameters:
 *      - in: body
 *        name: Invoice object
 *        required: true
 *        schema:
 *          $ref: '#/components/parameters/Invoice'
 *    responses:
 *      200:
 *        description: A invoice object
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Invoice'
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
    asyncMiddleWare(async (req, res) => {
        let invoiceReq = req.body;
        const authUserId = req.user.id;
        invoiceReq.user_id = authUserId;
        let itemsReq = invoiceReq.items;
        let businessReq = invoiceReq.business;
        let clientReq = invoiceReq.client;
        let itemsRes = [];
        let businessRes, clientRes, docNumberRes;
        let invoiceRes = {};

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
                            res.status(500).json({
                                error: 'Failed to create an item for the user',
                            });
                            throw new Error(
                                'Failed to create an item for the user',
                            );
                        }
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({ error: err.message });
                        throw new Error(err.message);
                    });
            }
        }

        await Businesses.findOrCreateBusiness({
            ...businessReq,
            user_id: authUserId,
        })
            .then(business => {
                if (business) {
                    businessRes = business.id;
                } else {
                    res.status(500).json({
                        error: 'Failed to create a business for the user',
                    });
                    throw new Error('Failed to create a business for the user');
                }
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({ error: err.message });
                throw new Error(err.message);
            });

        await Clients.findOrCreateClient({ ...clientReq, user_id: authUserId })
            .then(client => {
                if (client) {
                    clientRes = client.id;
                } else {
                    res.status(500).json({
                        error: 'Failed to create a client for the user',
                    });
                    throw new Error('Failed to create a client for the user');
                }
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({ error: err.message });
            });

        await Users.findDocNumberById(authUserId)
            .then(async docNumber => {
                await Users.updateDocNumber(
                    authUserId,
                    parseInt(docNumber['doc_number']) + 1,
                )
                    .then(docNumber => {
                        docNumberRes = docNumber[0];
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({ error: err.message });
                        throw new Error(err.message);
                    });
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({ error: err.message });
                throw new Error(err.message);
            });

        await Invoices.create({
            title: invoiceReq.title,
            doc_number: docNumberRes,
            user_id: invoiceReq.user_id,
            business_id: businessRes,
            client_id: clientRes,
            date: invoiceReq.date,
            is_paid: false,
        })
            .then(invoice => {
                if (invoice) {
                    Object.assign(invoiceRes, invoice[0]);
                    invoiceRes.items = [];
                } else {
                    res.status(500).json({
                        error: 'Failed to create an invoice for the user',
                    });
                    throw new Error('Failed to create an invoice for the user');
                }
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({ error: err.message });
                throw new Error(err.message);
            });

        for (const item of itemsRes) {
            await InvoiceItems.create({
                invoice_id: invoiceRes.id,
                item_id: item.id,
                quantity: item.quantity,
            })
                .then(invoiceItem => {
                    if (invoiceItem) {
                        invoiceRes.items.push(item);
                    } else {
                        res.status(500).json({
                            error: `Failed to create a relationship between invoice ${invoiceRes.id} and item ${item.id} for the user`,
                        });
                        throw new Error(
                            `Failed to create a relationship between invoice ${invoiceRes.id} and item ${item.id} for the user`,
                        );
                    }
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({ error: err.message });
                    throw new Error(err.message);
                });
        }

        if (invoiceRes) {
            res.status(201).json({
                invoice: invoiceRes,
            });
        }
    }),
);

/**
 * @swagger
 *
 * /invoices:
 *  get:
 *    description: get invoices of the current auth user
 *    summary: Returns an array of invoices
 *    security:
 *      - auth0: ['bearer token']
 *    tags:
 *      - invoices
 *    responses:
 *      200:
 *        description: An array of invoice objects
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              invoices:
 *                  $ref: '#/components/schemas/Invoice'
 *      401:
 *        $ref: '#/components/responses/UnauthorizedError'
 *      404:
 *        description: 'Invoices not found'
 *      5XX:
 *        $ref: '#/components/responses/InternalServerError'
 */

router.get(
    '/',
    authRequired,
    asyncMiddleWare(async (req, res) => {
        const authUserId = req.user.id;
        let invoicesRes = [];

        await Invoices.findAllByUserId(authUserId)
            .then(invoices => {
                if (!invoices) {
                    res.status(404).json({
                        error: 'Invoices not found for current user',
                    });
                    throw new Error('Invoices not found for current user');
                } else {
                    invoicesRes = [...invoices];
                }
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({ error: err.message });
            });

        for (let invoice of invoicesRes) {
            // find each item associated
            invoice.items = [];
            const items = await InvoiceItems.findByInvoiceId(invoice.id);
            for (let item of items) {
                const itemRes = await Items.findById(item.item_id);
                invoice.items.push({
                    ...itemRes,
                    quantity: item.quantity,
                });
            }

            // format date, yyyy-mm-dd
            invoice.date = invoice.date.toISOString().substring(0, 10);
        }

        if (invoicesRes) {
            res.status(200).json(invoicesRes);
        }
    }),
);

/**
 * @swagger
 *
 * /invoices/{invoice_id}:
 *  put:
 *    description: update a invoice for current auth user
 *    summary: Returns a single invoice
 *    security:
 *      - auth0: ['bearer token']
 *    tags:
 *      - invoices
 *    parameters:
 *      - in: body
 *        name: Invoice Object
 *        required: true
 *        schema:
 *            $ref: '#/components/schemas/Invoice'
 *    responses:
 *      200:
 *        description: 'Successfully updated Invoice'
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Invoice'
 *      400:
 *        description: 'Bad Request'
 *      401:
 *        $ref: '#/components/responses/UnauthorizedError'
 *      404:
 *        description: 'Invoice not found'
 *      5XX:
 *        description: 'Internal Server Error'
 */

router.put(
    '/:id',
    authRequired,
    asyncMiddleWare(async (req, res) => {
        const id = req.params.id;
        const { items, business, client, ...invoiceReq } = req.body;
        const authUserId = req.user.id;
        let invoiceRes = { items: [] };

        if (invoiceReq.id !== id) {
            res.status(400).json({
                error: 'Invoice id doest not match with parameter id',
            });
            throw new Error('Invoice id doest not match with parameter id');
        }

        await Invoices.findById(id)
            .then(async invoice => {
                if (!invoice) {
                    res.status(404).json({ error: `Invoice ${id} not found` });
                    throw new Error(`Invoice ${id} not found`);
                } else if (invoice.user_id !== authUserId) {
                    res.status(401).json({
                        error: `Not Authorized to make changes to Invoice ${invoice.id}`,
                    });
                    throw new Error(
                        `Not Authorized to make changes to Invoice ${invoice.id}`,
                    );
                } else if (
                    invoice.id === id &&
                    invoice.user_id === authUserId
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
                                                invoiceRes.items.push(item[0]);
                                            })
                                            .catch(err => {
                                                res.status(500).json({
                                                    error: err.message,
                                                });
                                                throw new Error(err.message);
                                            });
                                    } else {
                                        res.status(404).json({
                                            error: 'Item id not found',
                                        });
                                        throw new Error(err.message);
                                    }
                                })
                                .catch(err => {
                                    res.status(500).json({
                                        error: err.message,
                                    });
                                    throw new Error(err.message);
                                });
                        } else {
                            const { quantity, ...newItem } = itemReq;
                            await Items.create({
                                ...newItem,
                                user_id: authUserId,
                            })
                                .then(async item => {
                                    invoiceRes.items.push(item[0]);
                                })
                                .catch(err => {
                                    res.status(500).json({
                                        error: err.message,
                                    });
                                    throw new Error(err.message);
                                });
                        }
                    }
                    for (let i = 0; i < invoiceRes.items.length; i++) {
                        await InvoiceItems.findByItemId(invoiceRes.items[i].id)
                            .then(async invoiceItem => {
                                if (invoiceItem) {
                                    const { quantity, ...updateItem } = items[
                                        i
                                    ];
                                    await InvoiceItems.update(
                                        invoiceItem.invoice_id,
                                        invoiceItem.item_id,
                                        {
                                            quantity: quantity,
                                        },
                                    )
                                        .then(invoiceItem => {
                                            invoiceRes.items[i] = {
                                                ...invoiceRes.items[i],
                                                quantity:
                                                    invoiceItem[0].quantity,
                                            };
                                        })
                                        .catch(err => {
                                            console.log('here');
                                            res.status(500).json({
                                                error: err.message,
                                            });
                                            throw new Error(err.message);
                                        });
                                } else {
                                    const { quantity, ...updateItem } = items[
                                        i
                                    ];
                                    await InvoiceItems.create({
                                        invoice_id: invoiceReq.id,
                                        item_id: invoiceRes.items[i].id,
                                        quantity: quantity,
                                    })
                                        .then(invoiceItem => {
                                            invoiceRes.items[i] = {
                                                ...invoiceRes.items[i],
                                                quantity:
                                                    invoiceItem[0].quantity,
                                            };
                                        })
                                        .catch(err => {
                                            res.status(500).json({
                                                error: err.message,
                                            });
                                            throw new Error(err.message);
                                        });
                                }
                            })
                            .catch(err => {
                                res.status(500).json({ error: err.message });
                                throw new Error(err.message);
                            });
                    }

                    await Businesses.update(invoiceReq.business_id, business)
                        .then(business => {
                            invoiceRes.business = business;
                        })
                        .catch(err => {
                            res.status(500).json({ error: err.message });
                            throw new Error(err.message);
                        });

                    await Clients.update(invoiceReq.client_id, client)
                        .then(client => {
                            invoiceRes.client = client;
                        })
                        .catch(err => {
                            res.status(500).json({ error: err.message });
                            throw new Error(err.message);
                        });

                    await Invoices.update(id, invoiceReq)
                        .then(invoice => {
                            Object.assign(invoiceRes, invoice[0]);
                        })
                        .catch(err => {
                            res.status(500).json({ error: err.message });
                            throw new Error(err.message);
                        });
                }
            })
            .catch(err => {
                res.status(500).json({ error: err.message });
                throw new Error(err.message);
            });

        res.status(200).json({
            message: `Successfully updated invoice ${invoiceRes.id}`,
            invoice: invoiceRes,
        });
    }),
);

/**
 * @swagger
 *
 * /invoices/{invoice_id}:
 *  delete:
 *    description: Delete invoice of current auth user
 *    summary: Delete an invoice
 *    security:
 *      - auth0: ['bearer token']
 *    tags:
 *      - invoices
 *    responses:
 *      200:
 *        description: 'Successfully deleted invoice'
 *      401:
 *        $ref: '#/components/responses/UnauthorizedError'
 *      404:
 *        description: 'Invoice not found'
 *      5XX:
 *        $ref: '#/components/responses/InternalServerError'
 */

router.delete(
    '/:id',
    authRequired,
    asyncMiddleWare(async (req, res) => {
        const id = req.params.id;
        const authUserId = req.user.id;

        await Invoices.findById(id)
            .then(async invoice => {
                if (!invoice) {
                    res.status(404).json({ error: `Invoice ${id} not found` });
                    throw new Error(`Invoice ${id} not found`);
                } else if (invoice.user_id !== authUserId) {
                    res.status(401).json({
                        error: `Not authorized to make changes to Invoice ${id}`,
                    });
                    throw new Error(
                        `Not authorized to make changes to Invoice ${id}`,
                    );
                } else if (invoice.user_id === authUserId) {
                    await Invoices.remove(id)
                        .then(() => {
                            res.status(200).json({
                                message: `Successfully deleted Invoice ${id}`,
                            });
                        })
                        .catch(err => {
                            res.status(500).json({ error: err.message });
                            throw new Error(err.message);
                        });
                }
            })
            .catch(err => {
                res.status(500).json({ error: err.message });
                throw new Error(err.message);
            });
    }),
);

module.exports = router;
