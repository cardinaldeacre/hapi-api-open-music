require('dotenv').config();
const path = require('path');
const Inert = require('@hapi/inert');

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const albums = require('./src/api/albums');
const songs = require('./src/api/songs');
const users = require('./src/api/users');
const auth = require('./src/api/auth');
const playlist = require('./src/api/playlist');
const collaboration = require('./src/api/collaboration')
const _exports = require('./src/api/exports');

const tokenManager = require('./src/tokenize/TokenManager')

const AlbumService = require('./src/services/AlbumService');
const SongService = require('./src/services/SongService');
const AuthService = require('./src/services/AuthService');
const UsersService = require('./src/services/UsersService');
const PlaylistService = require('./src/services/PlaylistService')
const CollaborationService = require('./src/services/CollaborationService')
const ProducerService = require('./src/services/rabbitmq/ProducerService');
const StorageService = require('./src/services/storage/StorageService');

const UserValidator = require('./src/validator/users');
const AuthValidator = require('./src/validator/auth');
const PlaylistValidator = require('./src/validator/playlists');
const CollaborationValidator = require('./src/validator/collaboration');
const ExportsValidator = require('./src/validator/exports');
const UploadsValidator = require('./src/validator/uploads');

const ClientError = require('./src/exception/ClientError');
const NotFoundError = require('./src/exception/NotFoundError');
const AuthorizationError = require('./src/exception/AuthorizationError');
const CacheService = require('./src/services/redis/CacheService');
const AlbumLikeService = require('./src/services/AlbumLikeService');

const init = async () => {
	const userService = new UsersService();
	const authService = new AuthService();
	const albumService = new AlbumService();
	const songService = new SongService();
	const playlistService = new PlaylistService();
	const collaborationService = new CollaborationService();
	const storageService = new StorageService(path.resolve(__dirname, 'src/api/albums/covers/images'));
	const cacheService = new CacheService();
	const albumLikeService = new AlbumLikeService(cacheService);

	const server = Hapi.server({
		port: process.env.PORT,
		host: process.env.HOST,
		routes: {
			cors: {
				origin: ['*'],
			},
		},
	});

	await server.register([
		{
			plugin: Jwt
		},
		{
			plugin: Inert,
		},
	])

	server.auth.strategy('openmusic_jwt', 'jwt', {
		keys: process.env.ACCESS_TOKEN_KEY,
		verify: {
			aud: false,
			iss: false,
			sub: false,
			maxAgeSec: process.env.ACCESS_TOKEN_AGE || 3600,
		},
		validate: (data) => ({
			isValid: true,
			credentials: {
				id: data.decoded.payload.userId,
			},
		}),
	})

	await server.register([
		{
			plugin: auth,
			options: {
				userService,
				authService,
				tokenManager: tokenManager,
				validator: AuthValidator,
			},
		},
		{
			plugin: albums,
			options: {
				service: albumService,
				storageService,
				albumLikeService,
				validator: UploadsValidator
			},
		},
		{
			plugin: songs,
			options: {
				service: songService,
			},
		},
		{
			plugin: playlist,
			options: {
				service: playlistService,
				songService,
				validator: PlaylistValidator
			}
		},
		{
			plugin: users,
			options: { service: userService, validator: UserValidator }
		},
		{
			plugin: collaboration,
			options: {
				collaborationService,
				playlistService,
				validator: CollaborationValidator,
			},
		},
		{
			plugin: _exports,
			options: {
				service: ProducerService,
				playlistService,
				validator: ExportsValidator
			}
		}
	]);

	server.ext('onPreResponse', (request, h) => {
		const { response } = request;

		if (response instanceof ClientError) {
			const newResponse = h.response({
				status: 'fail',
				message: response.message,
			});

			newResponse.code(response.statusCode);
			return newResponse;
		}

		if (response instanceof AuthorizationError) {
			const newResponse = h.response({
				status: 'fail',
				message: response.message,
			});

			newResponse.code(response.statusCode);
			return newResponse;
		}

		if (response instanceof NotFoundError) {
			const newResponse = h.response({
				status: 'fail',
				message: response.message,
			});
			newResponse.code(response.statusCode);
			return newResponse;
		}

		if (response.isBoom) {
			if (response.output.statusCode >= 500) {
				console.error('Server Error (5xx) Stack Trace:', response);
				const newResponse = h.response({
					status: 'error',
					message: 'Terjadi kegagalan pada server kami',
				});
				newResponse.code(500);
				return newResponse;
			}

			if (response.output.statusCode === 401 || response.output.statusCode === 403) {
				const newResponse = h.response({
					status: 'fail',
					message: response.output.payload.message || 'Akses tidak diizinkan',
				});
				newResponse.code(response.output.statusCode);
				return newResponse;
			}

			return response;
		}

		return h.continue;
	});

	await server.start();
	console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
