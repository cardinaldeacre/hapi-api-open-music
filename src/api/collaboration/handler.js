const autoBind = require('auto-bind').default;

class CollaborationHandler {
    constructor({ collaborationService, playlistService, validator }) {
        this._collaborationService = collaborationService;
        this._playlistService = playlistService;
        this._validator = validator;

        autoBind(this);
    }

    async postCollaborationHandler(request, h) {
        this._validator.validateCollaborationPayload(request.payload);

        const { id: userId } = request.auth.credentials;
        const { playlistId, userId: collaboratorId } = request.payload;

        await this._playlistService.verifyPlaylistOwner(playlistId, userId)

        const collaborationId = await this._collaborationService.addCollaboration(playlistId, collaboratorId);

        return h.response({
            status: 'success',
            data: {
                collaborationId
            }
        }).code(201);
    }

    async deleteCollaborationHandler(request, h) {
        this._validator.validateCollaborationPayload(request.payload);

        const { id: userId } = request.auth.credentials;
        const { playlistId, userId: collaboratorId } = request.payload;

        await this._collaborationService.deleteCollaboration(playlistId, collaboratorId);
        await this._playlistService.verifyPlaylistOwner(playlistId, userId)

        return {
            status: 'success',
            message: 'Kolaborator berhasil dihapus'
        }
    }
}

module.exports = CollaborationHandler