const routes = (handler) => [
    {
        method: 'POST',
        path: '/authentications',
        handler: handler.postAuthHandler,
    },
    {
        method: 'PUT',
        path: '/authentications',
        handler: handler.puthAuthHandler,
    },
    {
        method: 'DELETE',
        path: '/authentications',
        handler: handler.deleteAuthHandler,
    },
];

module.exports = routes;