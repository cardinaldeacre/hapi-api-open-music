const { nanoid } = require('nanoid');
const pool = require('./PgPool');
const NotFoundError = require('../exception/NotFoundError');
const InvariantError = require('../exception/InvariantError');

class SongService {
	constructor() {
		this._pool = pool;
	}

	async addSong({ title, year, genre, performer, duration, albumId }) {
		const id = `song-${nanoid(16)}`;
		const createdAt = new Date().toISOString();

		const query = {
			text:
				'INSERT INTO songs (id, title, year, performer, genre, duration, album_id, created_at, updated_at) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $8) RETURNING id',
			values: [id, title, year, performer, genre, duration || null, albumId || null, createdAt],
		};

		try {
			const result = await this._pool.query(query);

			if (!result.rows[0].id) {
				throw new InvariantError('Lagu gagal ditambahkan');
			}

			return result.rows[0].id;
		} catch (error) {
			if (error.code === '23503') {
				throw new InvariantError('Gagal menambahkan lagu, id Album tidak ditemukan');
			}

			throw error;
		}
	}

	async getSongs({ title, performer }) {
		let queryText = 'SELECT id, title, performer FROM songs';
		const queryValues = [];
		const conditions = [];

		if (title) {
			queryValues.push(`%${title}%`);
			conditions.push(`title ILIKE $${queryValues.length}`);
		}
		if (performer) {
			queryValues.push(`%${performer}%`);
			conditions.push(`performer ILIKE $${queryValues.length}`);
		}

		if (conditions.length > 0) {
			queryText += ` WHERE ${conditions.join(' AND ')}`;
		}

		queryText += ' ORDER BY id ASC';

		const result = await this._pool.query({
			text: queryText,
			values: queryValues,
		});

		return result.rows;
	}

	async getSongById(id) {
		const query = {
			text:
				'SELECT id, title, year, performer, genre, duration, album_id as albumid FROM songs WHERE id = $1',
			values: [id],
		};

		const result = await this._pool.query(query);

		if (!result.rows.length) {
			throw new NotFoundError('Lagu tidak ditemukan');
		}

		return result.rows[0];
	}

	async editSongById(id, { title, year, performer, genre, duration, albumId }) {
		const updatedAt = new Date().toISOString();
		const query = {
			text:
				'UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, duration = $5, album_id = $6, updated_at = $7 WHERE id = $8 RETURNING id',
			values: [title, year, performer, genre, duration || null, albumId || null, updatedAt, id],
		};

		const result = await this._pool.query(query);

		if (!result.rows.length) {
			throw new NotFoundError('Gagal memperbarui lagu. Id tidak ditemukan');
		}
	}

	async verifySongIsExist(id) {
		const query = {
			text: 'SELECT id FROM songs where id = $1',
			values: [id]
		}

		const result = await this._pool.query(query);

		if (!result.rows.length) {
			throw new NotFoundError('Lagu tidak ditemukan. SongId tidak valid');
		}
	}

	async deleteSongById(id) {
		const query = {
			text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
			values: [id],
		};

		const result = await this._pool.query(query);

		if (!result.rows.length) {
			throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
		}
	}
}

module.exports = SongService;
