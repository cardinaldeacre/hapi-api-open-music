const routes = handler => [
	{
		method: 'POST',
		path: '/songs',
		handler: handler.postSongHandler,
	},
	{
		method: 'PUT',
		path: '/songs/{id}',
		handler: handler.putSongByIdHandler,
	},
	{
		method: 'DELETE',
		path: '/songs/{id}',
		handler: handler.deleteSongHandler,
	},
	{
		method: 'GET',
		path: '/songs/{id}',
		handler: handler.getSongByIdHandler,
	},
	{
		method: 'GET',
		path: '/songs',
		handler: handler.getSongsHandler,
	},
];

module.exports = routes;
