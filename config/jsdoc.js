module.exports = {
    definition: {
        openapi: '3.0.1',
        info: {
            title: 'ezInvoice API',
            version: '1.0.0',
            description: 'API server for ezInvoice',
            license: {
                name: 'MIT',
                url: 'https://en.wikipedia.org/wiki/MIT_License',
            },
        },
        tags: [
            {
                name: 'status',
                description: 'Everything about your status',
            },
        ],
        components: {
            securitySchemes: {},
            responses: {
                UnauthorizedError: {
                    description: 'Access token is missing or invalid',
                },
                BadRequest: {
                    description: 'Bad request',
                },
                NotFound: {
                    description: 'Not Found',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    message: {
                                        type: 'string',
                                        description:
                                            'A message about the result',
                                        example: 'Not Found',
                                    },
                                },
                            },
                        },
                    },
                },
                InternalServerError: {
                    description: 'Internal Server Error',
                },
            },
        },
    },
    apis: ['./api/**/*Router.js'],
};
