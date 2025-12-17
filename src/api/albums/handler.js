const autoBind = require('auto-bind').default;

class AlbumsHandler {
	constructor(service, storageService, albumLikeService, validator) {
		this._albumService = service;
		this._albumLikeService = albumLikeService;
		this._validator = validator;
		this._storageService = storageService;
		this.postUploadCoverHandler = this.postUploadCoverHandler.bind(this);

		autoBind(this);
	}

	async postAlbumHandler(request, h) {
		this._validator.validateAlbumPayload(request.payload);
		const { name, year } = request.payload;

		const albumId = await this._albumService.addAlbum({ name, year });

		return h
			.response({
				status: 'success',
				data: { albumId },
			})
			.code(201);
	}

	async getAlbumByIdHandler(request, h) {
		const { id } = request.params;
		const album = await this._albumService.getAlbumById(id);

		return {
			status: 'success',
			data: { album },
		};
	}

	async putAlbumByIdHandler(request, h) {
		this._validator.validateAlbumPayload(request.payload);
		const { id } = request.params;

		await this._albumService.editAlbumById(id, request.payload);

		return {
			status: 'success',
			message: 'Album berhasil diperbarui',
		};
	}

	async deleteAlbumHandler(request, h) {
		const { id } = request.params;
		await this._albumService.deleteAlbumById(id);

		return {
			status: 'success',
			message: 'Album berhasil dihapus',
		};
	}

	async postUploadCoverHandler(request, h) {
		const { cover } = request.payload;
		const { id } = request.params;

		this._validator.validateImageHeaders(cover.hapi.headers);

		const filename = await this._storageService.writeFile(cover, cover.hapi)
		const coverUrl = `http://${process.env.HOST}:${process.env.PORT}/albumsimage/${filename}`

		await this._albumService.updateAlbumCover(id, coverUrl);

		console.log(cover.hapi.headers);

		return h.response({
			status: 'success',
			message: 'Sampul berhasil diunggah'
		}).code(201);
	}

	async postAlbumLikeHandler(request, h) {
		const { id: albumId } = request.params;
		const { id: userId } = request.auth.credentials;

		await this._albumService.getAlbumById(albumId);
		await this._albumLikeService.addAlbumLike(userId, albumId);

		return h.response({
			status: 'success',
			message: 'Berhasil memberi like album'
		}).code(201);
	}

	async deleteAlbumLikeHandler(request, h) {
		const { id: albumId } = request.params;
		const { id: userId } = request.auth.credentials;

		await this._albumLikeService.deleteAlbumLike(userId, albumId);

		return {
			status: 'success',
			message: 'Batal menyukai album',
		};
	}

	async getAlbumLikesHandler(request, h) {
		const { id: albumId } = request.params;
		const { likes, isCache } = await this._albumLikeService.getAlbumLikes(albumId);

		const response = h.response({
			status: 'success',
			data: {
				likes,
			}
		})

		if (isCache) {
			response.header('X-Data-Source', 'cache');
		}

		return response;
	}
}

module.exports = AlbumsHandler;