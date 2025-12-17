const autoBind = require('auto-bind').default;

class AlbumsHandler {
	constructor(service, storageService, validator) {
		this._service = service;
		this._validator = validator;
		this._storageService = storageService;
		this.postUploadCoverHandler = this.postUploadCoverHandler.bind(this);

		autoBind(this);
	}

	async postAlbumHandler(request, h) {
		this._validator.validateAlbumPayload(request.payload);
		const { name, year } = request.payload;

		const albumId = await this._service.addAlbum({ name, year });

		return h
			.response({
				status: 'success',
				data: { albumId },
			})
			.code(201);
	}

	async getAlbumByIdHandler(request, h) {
		const { id } = request.params;
		const album = await this._service.getAlbumById(id);

		return {
			status: 'success',
			data: { album },
		};
	}

	async putAlbumByIdHandler(request, h) {
		this._validator.validateAlbumPayload(request.payload);
		const { id } = request.params;

		await this._service.editAlbumById(id, request.payload);

		return {
			status: 'success',
			message: 'Album berhasil diperbarui',
		};
	}

	async deleteAlbumHandler(request, h) {
		const { id } = request.params;
		await this._service.deleteAlbumById(id);

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

		await this._service.updateAlbumCover(id, coverUrl);

		console.log(cover.hapi.headers);

		return h.response({
			status: 'success',
			message: 'Sampul berhasil diunggah'
		}).code(201);
	}
}

module.exports = AlbumsHandler;