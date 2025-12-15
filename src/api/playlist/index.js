const PlaylistsHandler = require('./handler');
const routes = require('./routes');
const InvariantError = require('../../exception/InvariantError');

module.exports = {
    name: 'playlists',
    version: '1.0.0',
    register: async (server, { service, songService, validator }) => {

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

        const playlistsHandler = new PlaylistsHandler(
            service,
            songService,
            playlistsValidator
        );

        server.route(routes(playlistsHandler));
    },
};