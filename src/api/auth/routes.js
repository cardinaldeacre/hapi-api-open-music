const routes = (handler) => [
    {
        method: 'POST',
        path: '/auth',
        handler: handler.postAuthHandler,
    },
    {
        method: 'PUT',
        path: '/auth',
        handler: handler.puthAuthHandler,
    },
    {
        method: 'DELETE',
        path: '/auth',
        handler: handler.deleteAuthHandler,
    },
];

module.exports = routes;