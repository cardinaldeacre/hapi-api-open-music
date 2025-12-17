const { Pool } = require('pg');

class PlaylistService {
    constructor() {
        this._pool = new Pool();
    }

    async getPlaylistSongs(playlistId) {
        const query = {
            text: `SELECT playlists.id, playlists.name, songs.id as song_id, songs.title, songs.performer
                FROM playlists
                JOIN playlist_songs ON playlist_songs.playlist_id = playlists.id
                JOIN songs ON songs.id = playlist_songs.song_id
                WHERE playlists.id = $1`,
            values: [playlistId],
        };
        const result = await this._pool.query(query);

        return {
            playlist: {
                id: result.rows[0].id,
                name: result.rows[0].name,
                songs: result.rows.map((row) => ({
                    id: row.song_id,
                    title: row.title,
                    performer: row.performer,
                })),
            }
        }
    }
}

module.exports = PlaylistService;