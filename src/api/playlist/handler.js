const autoBind = require('auto-bind');
const InvariantError = require('../../exception/InvariantError')

class PlaylistsHandler {
    constructor(playlistService, songService, validator) {
        this._service = playlistService;
        this._songService = songService;
        this._validator = validator;

        autoBind(this);
    }

    async postPlaylistHandler(request, h) {
        this._validator.validatePlaylistPayload(request.payload);

        const { id: owner } = request.auth.credentials;
        const { name } = request.payload;

        const playlistId = await this._service.addPlaylist({ name, owner });

        return h.response({
            status: 'success',
            data: {
                playlistId,
            },
        }).code(201);
    }

    async getPlaylistsHandler(request, h) {
        const { id: owner } = request.auth.credentials;

        const playlists = await this._service.getPlaylists(owner);

        return {
            status: 'success',
            data: {
                playlists,
            },
        };
    }

    async deletePlaylistByIdHandler(request, h) {
        const { id } = request.params;
        const { id: userId } = request.auth.credentials;

        await this._service.verifyPlaylistOwner(id, userId);

        await this._service.deletePlaylistById(id);

        return {
            status: 'success',
            message: 'Playlist berhasil dihapus',
        };
    }

    async postSongToPlaylistHandler(request, h) {
        this._validator.validatePostSongToPlaylistPayload(request.payload);

        const { id: playlistId } = request.params;
        const { songId } = request.payload;
        const { id: userId } = request.auth.credentials;

        await this._service.verifyPlaylistAccess(playlistId, userId);
        await this._songsService.verifySongIsExist(songId);
        await this._service.addSongToPlaylist(playlistId, songId);

        return h.response({
            status: 'success',
            message: 'Lagu berhasil ditambahkan ke playlist',
        }).code(201);
    }

    async getPlaylistSongsHandler(request, h) {
        const { id: playlistId } = request.params;
        const { id: userId } = request.auth.credentials;

        await this._service.verifyPlaylistAccess(playlistId, userId);

        const playlist = await this._service.getPlaylistSongs(playlistId);

        return {
            status: 'success',
            data: {
                playlist,
            },
        };
    }

    async deleteSongFromPlaylistHandler(request, h) {
        this._validator.validatePostSongToPlaylistPayload(request.payload);

        const { id: playlistId } = request.params;
        const { songId } = request.payload;
        const { id: userId } = request.auth.credentials;

        await this._service.verifyPlaylistAccess(playlistId, userId);
        await this._service.deleteSongFromPlaylist(playlistId, songId);

        return {
            status: 'success',
            message: 'Lagu berhasil dihapus dari playlist',
        };
    }
}

module.exports = PlaylistsHandler;