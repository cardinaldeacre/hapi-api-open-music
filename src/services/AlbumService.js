const {nanoid} = require('nanoid');
const pool = require('./PgPool');
const InvariantError = require('../exception/InvariantError');
const NotFoundError = require('../exception/NotFoundError');

class AlbumService {
	constructor() {
		this._pool = pool;
	}

	async addAlbum({name, year}) {
		const id = `album-${nanoid(16)}`;
		const createdAt = new Date().toISOString();

		const query = {
			text:
				'INSERT INTO albums (id, name, year, created_at, updated_at) VALUES($1, $2, $3, $4, $4) RETURNING id',
			values: [id, name, year, createdAt],
		};

		const result = await this._pool.query(query);
		if (!result.rows[0].id) {
			throw new InvariantError('Album gagal ditambahkan');
			return result;
		}

		return result.rows[0].id;
	}

	async getAlbumById(id) {
		const query = {
			text: `
            SELECT a.id, a.name, a.year, s.id AS song_id, s.title, s.performer
            FROM albums a
            LEFT JOIN songs s ON a.id = s.album_id
            WHERE a.id = $1
            `,
			values: [id],
		};

		const result = await this._pool.query(query);

		if (!result.rows.length) {
			throw new NotFoundError('Album tidak ditemukan');
		}

		const albumInfo = result.rows[0];
		const songs = result.rows.filter(row => row.song_id).map(row => ({
			id: row.song_id,
			title: row.title,
			performer: row.performer,
		}));

		return {
			id: albumInfo.id,
			name: albumInfo.name,
			year: albumInfo.year,
			songs,
		};
	}

	async editAlbumById(id, {name, year}) {
		const updatedAt = new Date().toISOString();
		const query = {
			text: 'UPDATE albums SET name = $1, year = $2, updated_at = $3 WHERE id = $4 RETURNING id',
			values: [name, year, updatedAt, id],
		};

		const result = await this._pool.query(query);

		if (!result.rows.length) {
			throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
		}
	}

	async deleteAlbumById(id) {
		const query = {
			text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
			values: [id],
		};

		const result = await this._pool.query(query);

		if (!result.rows.length) {
			throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
		}
	}
}

module.exports = AlbumService;
