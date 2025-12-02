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
];

module.exports = routes;
