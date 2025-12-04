const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../exception/InvariantError');
const NotFoundError = require('../exception/NotFoundError');

class CollaborationService {
    constructor() {
        this._pool = new Pool();
    }

    async addColaboration(playlistId, userId) {
        try {
            const id = `collab-${nanoid(16)}`
            const query = {
                text: 'INSERT INTO collaborations (id, playlist_id, user_id) VALUES($1, $2, $3) RETURNING id',
                values: [id, playlistId, userId],
            };
            const result = await this._pool.query(query);

            if (!result.rows[0].id) {
                throw new InvariantError('Kolaborasi gagal ditambahkan');
            }
        } catch (error) {
            if (error.code === '23505') {
                throw new InvariantError('Gagal menambahkan kolaborasi. Kolaborator sudah terdaftar.');
            }
            if (error.code === '23503') {
                throw new InvariantError('Gagal menambahkan kolaborasi. PlaylistId atau UserId tidak valid.');
            }
            throw error;
        }
    }

    async deleteCollaboration(playlistId, userId) {
        const query = {
            text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id',
            values: [playlistId, userId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Kolaborasi gagal dihapus. Kolaborasi tidak ditemukan.');
        }
    }

    async verifyCollaboration(playlistId, userId) {
        const query = {
            text: 'SELECT id FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
            values: [playlistId, userId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Kolaborasi tidak ditemukan.');
        }
    }
}

module.exports = CollaborationService