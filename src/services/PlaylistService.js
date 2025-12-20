const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../exception/InvariantError');
const NotFoundError = require('../exception/NotFoundError');
const AuthorizationError = require('../exception/AuthorizationError');

class PlaylistService {
    constructor(collaborationService) {
        this._pool = new Pool();
        this._collaborationService = collaborationService;
    }

    async addPlaylist({ name, owner }) {
        const id = `playlist-${nanoid(16)}`;
        const query = {
            text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
            values: [id, name, owner],
        };

        const result = await this._pool.query(query);

        if (!result.rows[0].id) {
            throw new InvariantError('Playlist gagal ditambahkan')
        }

        return result.rows[0].id;
    }

    async getPlaylists(owner) {
        const query = {
            text: `
                SELECT 
                    playlists.id, playlists.name, users.username 
                FROM playlists
                LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
                LEFT JOIN users ON users.id = playlists.owner
                WHERE playlists.owner = $1 OR collaborations.user_id = $1
                GROUP BY playlists.id, users.username
            `,
            values: [owner],
        };
        const result = await this._pool.query(query);
        return result.rows;
    }

    async deletePlaylistById(id) {
        const query = {
            text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
        }
    }

    async addSongToPlaylist(playlistId, songId) {
        try {
            const id = `playlistsong-${nanoid(16)}`;
            const query = {
                text: 'INSERT INTO playlist_songs (id, playlist_id, song_id) VALUES ($1, $2, $3) RETURNING id',
                values: [id, playlistId, songId],
            };
            await this._pool.query(query);
        } catch (error) {
            if (error.code === '23505') {
                throw new InvariantError('Lagu sudah ada di dalam playlist ini.');
            }
            throw error;
        }
    }

    async getPlaylistSongs(playlistId) {
        const query = {
            text: `
                SELECT 
                    playlists.id, playlists.name, users.username,
                    songs.id AS song_id, songs.title, songs.performer
                FROM playlists
                INNER JOIN users ON users.id = playlists.owner
                LEFT JOIN playlist_songs ON playlist_songs.playlist_id = playlists.id
                LEFT JOIN songs ON songs.id = playlist_songs.song_id
                WHERE playlists.id = $1
            `,
            values: [playlistId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Playlist tidak ditemukan')
        }

        const palylistInfo = result.rows[0];

        const songs = result.rows
            .filter(row => row.song_id)
            .map(row => ({
                id: row.song_id,
                title: row.title,
                performer: row.performer,
            }));

        return {
            id: palylistInfo.id,
            name: palylistInfo.name,
            username: palylistInfo.username,
            songs: songs,
        };
    }

    async deleteSongFromPlaylist(playlistId, songId) {
        const query = {
            text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
            values: [playlistId, songId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Lagu gagal dihapus, lagu tidak ditemukan')
        }
    }

    async verifyPlaylistOwner(playlistId, owner) {
        const query = {
            text: 'SELECT owner FROM playlists WHERE id = $1',
            values: [playlistId],
        };

        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new NotFoundError('Playlist tidak ditemukan')
        }

        const playlist = result.rows[0]

        if (playlist.owner !== owner) {
            throw new AuthorizationError('Anda tidak dapat mengakses')
        }
    }

    async verifyPlaylistAccess(playlistId, userId) {
        try {
            await this.verifyPlaylistOwner(playlistId, userId)
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }

            try {
                await this._collaborationService.verifyCollaborator(playlistId, userId);
            } catch {
                throw error;
            }
        }
    }

    async getPlaylistById(id) {
        const query = {
            text: 'SELECT id, name FROM playlists WHERE id = $1',
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Playlist tidak ditemukan');
        }

        return result.rows[0];
    }

    async getSongsByPlaylistId(playlistId) {
        const query = {
            text: `SELECT songs.id, songs.title, songs.performer
                FROM songs
                LEFT JOIN playlist_songs ON playlist_songs.song_id = songs.id
                WHERE playlist_songs.playlist_id = $1`,
            values: [playlistId],
        };

        const result = await this._pool.query(query);
        return result.rows;
    }
}

module.exports = PlaylistService