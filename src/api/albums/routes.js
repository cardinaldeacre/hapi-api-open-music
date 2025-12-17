const path = require('path');

const routes = handler => [
	{
		method: 'POST',
		path: '/albums',
		handler: handler.postAlbumHandler,
	},
	{
		method: 'PUT',
		path: '/albums/{id}',
		handler: handler.putAlbumByIdHandler,
	},
	{
		method: 'DELETE',
		path: '/albums/{id}',
		handler: handler.deleteAlbumHandler,
	},
	{
		method: 'GET',
		path: '/albums/{id}',
		handler: handler.getAlbumByIdHandler,
	},
	{
		method: 'POST',
		path: '/albums/{id}/covers',
		handler: handler.postUploadCoverHandler,
		options: {
			payload: {
				allow: 'multipart/form-data',
				multipart: true,
				output: 'stream',
				maxBytes: 512000,
			},
		},
	},
	{
		method: 'GET',
		path: '/albums/images/{param*}',
		handler: {
			directory: {
				path: path.resolve(__dirname, 'covers/images'),
			},
		},
	},
];

module.exports = routes;
