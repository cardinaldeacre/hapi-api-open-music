const routes = require('./routes');
const SongsHandler = require('./handler');
const {SongPayloadSchema} = require('../../validator/songs');
const InvariantError = require('../../exception/InvariantError');

module.exports = {
	name: 'songs',
	version: '1.0.0',
	register: async (server, {service}) => {
		const songsValidator = {
			validateSongPayload: payload => {
				const validationResult = SongPayloadSchema.validate(payload);

				if (validationResult.error) {
					throw new InvariantError(validationResult.error.message);
				}
			},
		};

		const handler = new SongsHandler(service, songsValidator);
		server.route(routes(handler));
	},
};
