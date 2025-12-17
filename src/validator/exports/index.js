const Joi = require('@hapi/joi');
const InvariantError = require('../../exception/InvariantError');

const ExportPlaylistPayloadSchema = Joi.object({
    targetEmail: Joi.string().email({ tlds: true }).required(),
});

const ExportsValidator = {
    validateExportPlaylistPayload: (payload) => {
        const validationResult = ExportPlaylistPayloadSchema.validate(payload);
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    },
};

module.exports = ExportsValidator;