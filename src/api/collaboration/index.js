const CollaborationHandler = require('./handler');
const routes = require('./routes');
const InvariantError = require('../../exception/InvariantError');

module.exports = {
    name: 'collaboration',
    version: '1.0.0',
    register: async (server, { collaborationService, playlistService, validator }) => {
        const collaborationValidator = {
            validateCollaborationPayload: (payload) => {
                const { CollaborationPayloadSchema } = validator;
                const validationResult = CollaborationPayloadSchema.validate(payload);
                if (validationResult.error) {
                    throw new InvariantError(validationResult.error.message);
                }
            }
        }

        const collaborationHandler = new CollaborationHandler({
            collaborationService,
            playlistService,
            validator: collaborationValidator
        });

        server.route(routes(collaborationHandler));
    }
}