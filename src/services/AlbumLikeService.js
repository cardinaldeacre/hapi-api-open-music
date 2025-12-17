const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('./../exception/InvariantError');
const CacheService = require('./redis/CacheService');

class AlbumLikeSerice {
    constructor() {
        this._pool = new Pool();
        this._cacheService = CacheService;
    }

    async addAlbumLike(userId, albumId) {
        const queryCheckLike = {
            text: 'SELECT id FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
            values: [userId, albumId],
        };

        const resultCheck = await this._pool(queryCheckLike);

        if (!resultCheck.rows.length > 0) {
            throw new InvariantError('Gagal memberi like, Anda sudah memberi like album ini');
        }

        const id = `like-${nanoid(16)}`;
        const queryAddLike = {
            text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
            values: [id, userId, albumId],
        };

        const result = await this._pool.query(queryAddLike);

        if (!result.rows.length > 0) {
            throw new InvariantError('Gagal memberi like album');
        }

        await this._cacheService.delete(`likes:${albumId}`);
    }

    async deleteAlbumLike(userId, albumId) {
        const query = {
            text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
            values: [userId, albumId],
        };

        const result = await this._pool(query);

        if (!result.rows.length) {
            throw new InvariantError('Gagal membatalkan suka, Like tidak ditemukan');
        }

        await this._cacheService.delete(`likes:${albumId}`);
    }

    async getAlbumLikes(albumId) {
        try {
            const result = await this._cacheService.get(`likes:${albumId}`);
            return {
                likes: parseInt(result, 10),
                isCache: true,
            }
        } catch (error) {
            const query = {
                text: 'SELECT id FROM user_album_likes WHERE album_id = $1',
                values: [albumId],
            };

            const result = await this._pool.query(query);
            const likesCount = result.rows.length;

            await this._cacheService.set(`likes:${albumId}`, likesCount.toString());
            return {
                likes: likesCount,
                isCache: false
            }
        }
    }
}

module.exports = AlbumLikeSerice;