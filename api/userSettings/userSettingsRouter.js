const express = require('express');
const authRequired = require('../middleware/authRequired');
const router = express.Router();
const UserSettings = require('./userSettingsModel');

/**
 * @swagger
 * components:
 *  parameters:
 *    UserSetting:
 *      type: object
 *      properties:
 *          name:
 *              type: string
 *              description: The name of the user's business
 *              example: John Doe LLC
 *          email:
 *              type: string
 *              format: email
 *              description: The email of the user's business
 *              example: johndoe@johndoellc.com
 *          street:
 *              type: string
 *              description: The street name of a address
 *              example: 123 invoice street
 *          city_state:
 *              type: string
 *              description: The city and state of a address
 *              example: City, State
 *          zip:
 *              type: string
 *              description: The zip code of a address
 *              example: '01234'
 *          phone:
 *              type: string
 *              format: phone
 *              description: The phone number of a user's business
 *              example: 123-234-3456
 *      example:
 *          name: John Doe LLC
 *          email: johndoe@johndoellc.com
 *          street: 123 invoice street
 *          city_state: City, State
 *          zip: '01234'
 *          phone: 123-234-3456
 *
 *  schemas:
 *    UserSetting:
 *      type: object
 *      properties:
 *        id:
 *          type: integer
 *          description: The auto-generated id of the user setting
 *          example: 30
 *        name:
 *          type: string
 *          description: The name of the user's business
 *          example: John Doe LLC
 *        email:
 *          type: string
 *          format: email
 *          description: The email of the user's business
 *          example: johndoe@johndoellc.com
 *        street:
 *          type: string
 *          description: The street name of a address
 *          example: 123 invoice street
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
 *          description: The phone number of a user's business
 *          example: 123-234-3456
 *        user_id:
 *          type: integer
 *          description: The user of the setting belongs to
 *          example: 25
 *      example:
 *        id: 30
 *        name: John Doe LLC
 *        email: johndoe@johndoellc.com
 *        street: 123 invoice street
 *        city_state: City, State
 *        zip: '01234'
 *        phone: 123-234-3456
 *        user_id: 25
 */

/**
 * @swagger
 *
 * /settings:
 *  post:
 *    description: Create a user setting for auth user
 *    summary: Create a single user setting
 *    security:
 *      - auth0: ['bearer token']
 *    tags:
 *      - user settings
 *    parameters:
 *      - in: body
 *        name: User setting object
 *        required: true
 *        schema:
 *          $ref: '#/components/parameters/UserSetting'
 *    responses:
 *      200:
 *        description: A user setting object
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/UserSetting'
 *      401:
 *        $ref: '#/components/responses/UnauthorizedError'
 *      400:
 *        $ref: '#/components/responses/BadRequest'
 *      5XX:
 *        $ref: '#/components/responses/InternalServerError'
 */

router.post('/', authRequired, (req, res) => {
    let userSettingReq = req.body;
    const authUserId = req.user.id;
    userSettingReq.user_id = authUserId;

    UserSettings.findByUserId(authUserId)
        .then(userSetting => {
            if (userSetting) {
                return res
                    .status(409)
                    .json({ error: 'User Setting already exists' });
            }
            UserSettings.create(userSettingReq)
                .then(userSetting => {
                    if (userSetting) {
                        return res.status(200).json({
                            message: 'Successfully create the user settings',
                            settings: userSetting[0],
                        });
                    }
                    res.status(500).json({
                        error: 'Failed to create a new setting for the user',
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
 * /settings:
 *  get:
 *    description: get user setting of the current auth user
 *    summary: Returns a single user setting
 *    security:
 *      - auth0: ['bearer token']
 *    tags:
 *      - user settings
 *    responses:
 *      200:
 *        description: A user settings object
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/UserSetting'
 *      401:
 *        $ref: '#/components/responses/UnauthorizedError'
 *      404:
 *        description: 'User settings not found'
 *      5XX:
 *        $ref: '#/components/responses/InternalServerError'
 */

router.get('/', authRequired, (req, res) => {
    const authUserId = req.user.id;

    UserSettings.findByUserId(authUserId)
        .then(userSetting => {
            if (userSetting) {
                return res.status(200).json(userSetting);
            }
            res.status(404).json({
                error: 'User settings not found for current user',
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
 * /settings:
 *  put:
 *    description: update a user setting for current auth user
 *    summary: Returns a single user setting
 *    security:
 *      - auth0: ['bearer token']
 *    tags:
 *      - user settings
 *    parameters:
 *      - in: body
 *        name: User Object
 *        required: true
 *        schema:
 *            $ref: '#/components/schemas/UserSetting'
 *    responses:
 *      200:
 *        description: 'Successfully updated user settings'
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/UserSetting'
 *      401:
 *        $ref: '#/components/responses/UnauthorizedError'
 *      404:
 *        description: 'User settings not found'
 *      5XX:
 *        description: 'Internal Server Error'
 */

router.put('/', authRequired, (req, res) => {
    const userSettingReq = req.body;
    const authUserId = req.user.id;

    if (authUserId === userSettingReq.user_id) {
        if (userSettingReq) {
            return UserSettings.findByUserId(authUserId)
                .then(userSetting => {
                    if (userSetting) {
                        if (userSetting.id === userSettingReq.id) {
                            return UserSettings.update(
                                userSetting.id,
                                userSettingReq,
                            )
                                .then(updated => {
                                    res.status(200).json({
                                        message: `Successfully updated user setting ${userSetting.id}`,
                                        settings: updated[0],
                                    });
                                })
                                .catch(err => {
                                    res.status(500).json({
                                        message: `Failed to update user setting ${userSetting.id}`,
                                        error: err.message,
                                    });
                                });
                        }
                        return res.status(400).json({
                            error:
                                'User setting id doest not match with record',
                        });
                    }
                    res.status(404).json({
                        error: 'User setting not found for current user',
                    });
                })
                .catch(err => {
                    res.status(500).json({ error: err.message });
                });
        }
        return res
            .status(400)
            .json({ error: 'User setting body missing or incomplete ' });
    }
    res.status(401).json({ error: 'Not authorized to complete this request' });
});

/**
 * @swagger
 *
 * /settings:
 *  delete:
 *    description: Delete user setting of current auth user
 *    summary: Delete a user setting
 *    security:
 *      - auth0: ['bearer token']
 *    tags:
 *      - user settings
 *    responses:
 *      200:
 *        description: 'Successfully deleted user settings'
 *      401:
 *        $ref: '#/components/responses/UnauthorizedError'
 *      404:
 *        description: 'User settings not found'
 *      5XX:
 *        $ref: '#/components/responses/InternalServerError'
 */

router.delete('/', authRequired, (req, res) => {
    const authUserId = req.user.id;

    UserSettings.findByUserId(authUserId)
        .then(userSetting => {
            if (userSetting) {
                if (userSetting.user_id === authUserId) {
                    return UserSettings.remove(userSetting.id)
                        .then(() => {
                            res.status(200).json({
                                message:
                                    'Successfully deleted the user setting',
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
            res.status(404).json({ error: 'User setting not found' });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err.message });
        });
});

module.exports = router;
