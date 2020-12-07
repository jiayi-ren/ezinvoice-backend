const express = require('express');
const authRequired = require('../middleware/authRequired');
const router = express.Router();
const Businesses = require('./businessModel');

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

router.post('/', authRequired, (req, res) => {
    let businessReq = req.body;
    const authUserId = req.user.id;
    businessReq.user_id = authUserId;

    if (!businessReq.email) {
        return res.status(400).json({ error: 'Business email required' });
    }

    Businesses.findByEmail(businessReq.email)
        .then(business => {
            if (business) {
                return res.status(409).json({
                    error: `Business with email ${businessReq.email} already exists`,
                });
            }
            Businesses.create(businessReq)
                .then(business => {
                    if (business) {
                        return res.status(200).json({
                            message: 'Successfully create the business',
                            business: business[0],
                        });
                    }
                    res.status(500).json({
                        error: 'Failed to create a business for the user',
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

router.get('/', authRequired, (req, res) => {
    const authUserId = req.user.id;

    Businesses.findAllByUserId(authUserId)
        .then(businesses => {
            if (businesses) {
                return res.status(200).json(businesses);
            }
            res.status(404).json({
                error: 'Businesses not found for current user',
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

router.put('/:id', authRequired, (req, res) => {
    const id = req.params.id;
    const businessReq = req.body;
    const authUserId = req.user.id;

    if (authUserId === businessReq.user_id) {
        return Businesses.findById(id)
            .then(business => {
                if (business) {
                    if (business.id === id && business.id === businessReq.id) {
                        return Businesses.update(id, businessReq)
                            .then(updated => {
                                res.status(200).json({
                                    message: `Successfully updated business ${business.id}`,
                                    business: updated[0],
                                });
                            })
                            .catch(err => {
                                res.status(500).json({
                                    message: `Failed to update business ${business.id}`,
                                    error: err.message,
                                });
                            });
                    }
                    return res.status(400).json({
                        error: 'Business id doest not match with record',
                    });
                }
                res.status(404).json({
                    error: 'Business not found for current user',
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

router.delete('/:id', authRequired, (req, res) => {
    const id = req.params.id;
    const authUserId = req.user.id;

    Businesses.findById(id)
        .then(business => {
            if (business) {
                if (business.user_id === authUserId) {
                    return Businesses.remove(business.id)
                        .then(() => {
                            res.status(200).json({
                                message: 'Successfully deleted the business',
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
            res.status(404).json({ error: 'Business not found' });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err.message });
        });
});

module.exports = router;