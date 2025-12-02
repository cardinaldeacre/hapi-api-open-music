const routes = require('./routes');
const AlbumHandler = require('./handler');
const {AlbumPayloadSchema} = require('../../validator/albums');
const InvariantError = require('../../exception/InvariantError');

module.exports = {
	name: 'albums',
	version: '1.0.0',
	register: async (server, {service}) => {
		const albumsValidator = {
			validateAlbumPayload: payload => {
				const validationResult = AlbumPayloadSchema.validate(payload);

				if (validationResult.error) {
					throw new InvariantError(validationResult.error.message);
				}
			},
		};

		const handler = new AlbumHandler(service, albumsValidator);
		server.route(routes(handler));
	},
};
