const autoBind = require('auto-bind').default;

class ExportsHandler {
    constructor(service, playlistService, validator) {
        this._service = service;
        this._playlistService = playlistService;
        this._validator = validator;

        autoBind(this);
    }

    async postExportPlaylistHandler(request, h) {
        this._validator.validateExportPlaylistPayload(request.payload);

        const { playlistId } = request.params;
        const { id: userId } = request.auth.credentials;

        await this._playlistService.verifyPlayListOwner(playlistId, userId);

        const message = {
            playlistId,
            targetEmail: request.payload.targetEmail,
        }

        await this._service.sendMessage('export:playlists', JSON.stringify(message));

        return h.response({
            status: 'success',
            message: 'Permintaan anda sedang kami proses',
        }).code(201);
    }
}

module.exports = ExportsHandler;