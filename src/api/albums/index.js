const routes = require('./routes');
const AlbumHandler = require('./handler');
const { AlbumPayloadSchema } = require('../../validator/albums');
const InvariantError = require('../../exception/InvariantError');

module.exports = {
	name: 'albums',
	version: '1.0.0',
	register: async (server, { service, storageService, validator }) => {
		const albumsValidator = {
			validateAlbumPayload: payload => {
				const validationResult = AlbumPayloadSchema.validate(payload);

				if (validationResult.error) {
					throw new InvariantError(validationResult.error.message);
				}
			},
			validateImageHeaders: (headers) => {
				validator.validateImageHeaders(headers)
			}
		};

		const handler = new AlbumHandler(service, storageService, albumsValidator);
		server.route(routes(handler));
	},
};
