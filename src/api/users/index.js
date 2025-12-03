const UserHandler = require('./handler');
const routes = require('./routes');
const InvariantError = require('../../exception/InvariantError');

module.exports = {
    name: 'users',
    version: '1.0.0',
    register: async (server, { service, validator }) => {
        const usersValidator = {
            validateUserPayload: (payload) => {
                const { UserPayloadSchema } = validator;
                const validationResult = UserPayloadSchema.validate(payload);

                if (validationResult.error) {
                    throw new InvariantError(validationResult.error.message)
                }
            }
        }

        const userHandler = new UserHandler(service, usersValidator);
        server.route(routes(userHandler));
    }
}