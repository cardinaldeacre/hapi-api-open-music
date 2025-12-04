const PlaylistsHandler = require('./handler');
const routes = require('./routes');
const InvariantError = require('../../exception/InvariantError');

module.exports = {
    name: 'playlists',
    version: '1.0.0',
    register: async (server, { service, songsService, validator }) => {

        const playlistsValidator = {
            validatePlaylistPayload: (payload) => {
                const { PlaylistPayloadSchema } = validator;
                const validationResult = PlaylistPayloadSchema.validate(payload);
                if (validationResult.error) {
                    throw new InvariantError(validationResult.error.message);
                }
            },
            validatePostSongToPlaylistPayload: (payload) => {
                const { PostSongToPlaylistPayloadSchema } = validator;
                const validationResult = PostSongToPlaylistPayloadSchema.validate(payload);
                if (validationResult.error) {
                    throw new InvariantError(validationResult.error.message);
                }
            },
        };

        const playlistsHandler = new PlaylistsHandler({
            playlistsService: service,
            songsService,
            validator: playlistsValidator
        });

        server.route(routes(playlistsHandler));
    },
};