const autoBind = require('auto-bind').default;

class AuthHandler {
    constructor(userService, authService, tokenManager, validator) {
        this._userService = userService;
        this._authService = authService;
        this._tokenManager = tokenManager;
        this._validator = validator;

        autoBind(this);
    }

    async postAuthHandler(request, h) {
        this._validator.validatePostAuthPayload(request.payload);

        const { username, password } = request.payload;
        const userId = await this._userService.verifyUserCredential(username, password);
        const accessToken = this._tokenManager.generateAccessToken({ userId });
        const refreshToken = this._tokenManager.generateRefreshToken({ userId });

        await this._authService.addRefreshToken(refreshToken);

        return h.response({
            status: 'success',
            data: {
                accessToken,
                refreshToken,
            }
        }).code(201);
    }

    async puthAuthHandler(request, h) {
        this._validator.validatePutAuthPayload(request.payload);

        const { refreshToken } = request.payload;
        await this._authService.verifyRefreshToken(refreshToken);

        const { userId } = this._tokenManager.verifyRefreshToken(refreshToken);
        const accessToken = this._tokenManager.generateAccessToken({ userId });

        return h.response({
            status: 'success',
            data: {
                accessToken
            }
        }).code(200)
    }

    async deleteAuthHandler(request, h) {
        this._validator.validateDeleteAuthPayload(request.payload);

        const { refreshToken } = request.payload;
        await this._authService.verifyRefreshToken(refreshToken);
        await this._authService.deleteRefreshToken(refreshToken);

        return h.response({
            status: 'success',
            message: 'Refresh token berhasil dihapus'
        }).code(200)
    }
}
module.exports = AuthHandler;