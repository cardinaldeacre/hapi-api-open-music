const routes = require('./routes');
const InvaritantError = require('../../exception/InvariantError');
const AuthHandler = require('./handler');

module.exports = {
    name: 'auth',
    version: '1.0.0',
    register: async (server, { userService, authService, tokenManager, validator }) => {
        const authValidator = {
            validatePostAuthPayload: (payload) => {
                const { PostAuthPayloadSchema } = validator;
                const validationResult = PostAuthPayloadSchema.validate(payload);

                if (validationResult.error) {
                    throw new InvaritantError(validationResult.error.message);
                }
            },
            validatePutAuthPayload: (payload) => {
                const { PutAuthPayloadSchema } = validator;
                const validationResult = PutAuthPayloadSchema.validate(payload);

                if (validationResult.error) {
                    throw new InvaritantError(validationResult.error.message);
                }
            },
            validateDeleteAuthPayload: (payload) => {
                const { DeleteAuthPayloadSchema } = validator;
                const validationResult = DeleteAuthPayloadSchema.validate(payload);
                if (validationResult.error) {
                    throw new InvaritantError(validationResult.error.message);
                }
            },
        }

        const authHandler = new AuthHandler(
            userService,
            authService,
            tokenManager,
            authValidator
        );

        server.route(routes(authHandler));
    }
}