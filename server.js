require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const albums = require('./src/api/albums');
const songs = require('./src/api/songs');

const AlbumService = require('./src/services/AlbumService');
const SongService = require('./src/services/SongService');
const AuthService = require('./src/services/AuthService');
const UsersService = require('./src/services/UsersService');

const UserValidator = require('./src/validator/users');
const AuthValidator = require('./src/validator/auth');

const ClientError = require('./src/exception/ClientError');

const init = async () => {
	const userService = new UsersService();
	const authService = new AuthService();
	const albumService = new AlbumService();
	const songService = new SongService();

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
			plugin: albums,
			options: {
				service: albumService,
			},
		},
		{
			plugin: songs,
			options: {
				service: songService,
			},
		},
		{
			plugin: Jwt
		}
	]);

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
			plugin: users,
			options: { service: userService, validator: UserValidator }
		},
		{
			plugin: auth,
			options:
				userService,
			authService,
			tokenManager: tokenManager,
			validator: AuthValidator

		}
	])

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

		if (response.isBoom) {
			if (response.output.statusCode === 404) {
				const newResponse = h.response({
					status: 'fail',
					message: 'Resource tidak ditemukan',
				});
				newResponse.code(404);
				return newResponse;
			}
			if (response.output.statusCode === 400) {
				const newResponse = h.response({
					status: 'fail',
					message: response.output.payload.message,
				});
				newResponse.code(400);
				return newResponse;
			}
			if (response.output.statusCode >= 500) {
				console.error('Server Error (5xx) Stack Trace:', response);
				const newResponse = h.response({
					status: 'error',
					message: 'Terjadi kegagalan pada server kami',
				});
				newResponse.code(500);
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
