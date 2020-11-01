const express = require('express');
const authRequired = require('../middleware/authRequired');
const router = express.Router();
const Users = require('./userModel');

/**
 * @swagger
 * components:
 *  schemas:
 *    User:
 *      type: object
 *      required:
 *         - name
 *         - email
 *      properties:
 *        id:
 *          type: integer
 *          description: The auto-generated id of the user
 *          example: 25
 *        name:
 *          type: string
 *          description: The name of the user
 *          example: John Doe
 *        email:
 *          type: string
 *          format: email
 *          description: The email of the user
 *          example: johndoe@johndoe.com
 *        picture:
 *          type: string
 *          description: The picture url of the user
 *          example: https://john_doe_picture.png
 *        sub:
 *          type: string
 *          description: The sub claim of the user
 *          example: auth0|5f9f17d01336ef006eaeb269
 *      example:
 *        id: 25
 *        name: John Doe
 *        email: johndoe@johndoe.com
 *        picture: https://john_doe_picture.png
 *        sub: auth0|5f9f17d01336ef006eaeb269
 */

/**
 * @swagger
 *
 * /users:
 *  get:
 *    description: get current auth user info
 *    summary: Returns a single user
 *    security:
 *      - auth0: ['bearer token']
 *    tags:
 *      - users
 *    responses:
 *      200:
 *        description: A user object
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 *      401:
 *        $ref: '#/components/responses/UnauthorizedError'
 *      404:
 *        description: 'User not found'
 *      5XX:
 *        $ref: '#/components/responses/InternalServerError'
 */

router.get('/', authRequired, (req, res) => {
    const authUserId = req.user.id;

    Users.findById(authUserId)
        .then(user => {
            if (user) {
                return res.status(200).json(user);
            }
            res.status(404).json({ error: 'User not found' });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err.message });
        });
});

/**
 * @swagger
 * components:
 *  parameters:
 *    userId:
 *      name: id
 *      in: path
 *      description: Id of the user to return
 *      required: true
 *      example: 25
 *      schema:
 *        type: string
 *
 * /users/{id}:
 *  get:
 *    description: Find user by id
 *    summary: Returns a single user
 *    security:
 *      - auth0: ['bearer token']
 *    tags:
 *      - users
 *    parameters:
 *      - $ref: '#/components/parameters/userId'
 *    responses:
 *      200:
 *        description: A user object
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 *      401:
 *        $ref: '#/components/responses/UnauthorizedError'
 *      404:
 *        description: 'User not found'
 *      5XX:
 *        $ref: '#/components/responses/InternalServerError'
 */

router.get('/:id', authRequired, (req, res) => {
    const id = parseInt(req.params.id);
    const authUserId = req.user.id;

    if (authUserId === id) {
        return Users.findById(id)
            .then(user => {
                if (user) {
                    return res.status(200).json(user);
                }
                res.status(404).json({ error: 'User not found' });
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({ error: err.message });
            });
    }
    res.status(401).json({ error: 'Not authorized to complete this request' });
});

/**
 * @swagger
 * components:
 *  parameters:
 *    userId:
 *      name: id
 *      in: path
 *      description: Id of the user to return
 *      required: true
 *      example: 25
 *      schema:
 *        type: string
 *    User:
 *      type: object
 *      required:
 *         - name
 *         - email
 *      properties:
 *        name:
 *          type: string
 *          description: The name of the user
 *          example: John Doe
 *        email:
 *          type: string
 *          format: email
 *          description: The email of the user
 *          example: johndoe@johndoe.com
 *        picture:
 *          type: string
 *          description: The picture url of the user
 *          example: https://john_doe_picture.png
 *      example:
 *        name: John Doe
 *        email: johndoe@johndoe.com
 *        picture: https://john_doe.png
 *
 * /users/{id}:
 *  put:
 *    description: update a user
 *    summary: Returns a single user
 *    security:
 *      - auth0: ['bearer token']
 *    tags:
 *      - users
 *    parameters:
 *      - in: body
 *        name: User Object
 *        required: true
 *        schema:
 *            $ref: '#/components/parameters/User'
 *    responses:
 *      201:
 *        description: 'Successfully updated user'
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 *      401:
 *        $ref: '#/components/responses/UnauthorizedError'
 *      400:
 *        description: 'User body missing or incomplete'
 *      5XX:
 *        description: 'Internal Server Error'
 */

router.put('/:id', authRequired, (req, res) => {
    const user = req.body;
    const id = parseInt(req.params.id);
    const authUserId = req.user.id;

    if (authUserId === id) {
        if (user) {
            return Users.findById(id)
                .then(
                    Users.update(id, user)
                        .then(updated => {
                            res.status(200).json({
                                message: `Successfully updated user ${id} `,
                                user: updated[0],
                            });
                        })
                        .catch(err => {
                            res.status(500).json({
                                message: `Failed to update user ${id}`,
                                error: err.message,
                            });
                        }),
                )
                .catch(err => {
                    res.status(404).json({
                        message: `User ${id} not found`,
                        error: err.message,
                    });
                });
        }
        return res
            .status(400)
            .json({ error: 'User body missing or incomplete ' });
    }
    res.status(401).json({ error: 'Not authorized to complete this request' });
});

/**
 * @swagger
 * components:
 *  parameters:
 *    userId:
 *      name: id
 *      in: path
 *      description: Id of the user to return
 *      required: true
 *      example: 25
 *      schema:
 *        type: string
 *
 * /users/{id}:
 *  delete:
 *    description: Delete user by id
 *    summary: Delete a user
 *    security:
 *      - auth0: ['bearer token']
 *    tags:
 *      - users
 *    parameters:
 *      - $ref: '#/components/parameters/userId'
 *    responses:
 *      200:
 *        description: 'Successfully deleted user'
 *      401:
 *        $ref: '#/components/responses/UnauthorizedError'
 *      404:
 *        description: 'User not found'
 *      5XX:
 *        $ref: '#/components/responses/InternalServerError'
 */
router.delete('/:id', authRequired, (req, res) => {
    const id = parseInt(req.params.id);
    const authUserId = req.user.id;

    if (authUserId === id) {
        return Users.findById(id)
            .then(user => {
                if (user) {
                    Users.remove(user.id)
                        .then(() => {
                            res.status(200).json({
                                message: `Successfully deleted user '${id}'`,
                            });
                        })
                        .catch(err => {
                            console.log(err);
                            res.status(500).json({ error: err.message });
                        });
                } else {
                    res.status(404).json({ error: 'Sser not found' });
                }
            })
            .catch(() => {
                console.log(err);
                res.status(500).json({ error: err.message });
            });
    }
    res.status(401).json({ error: 'Not authorized to complete this request' });
});

module.exports = router;
