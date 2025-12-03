/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
    pgm.createTable('playlist_songs', {
        id: {
            type: 'VARCHAR(50)',
            primaryKey: true,
        },
        playlist_id: {
            type: 'VARCHAR(50)',
            notNull: true,
        },
        song_id: {
            type: 'VARCHAR(50)',
            notNull: true,
        },
    });

    pgm.addConstraint('playlist_songs', 'fk_playlist_songs.playlist_id_playlists.id', {
        foreignKeys: [{
            references: 'playlists',
            columns: 'playlist_id',
            onDelete: 'cascade',
        }],
    });

    pgm.addConstraint('playlist_songs', 'fk_playlist_songs.song_id_songs.id', {
        foreignKeys: [{
            references: 'songs',
            columns: 'song_id',
            onDelete: 'cascade',
        }],
    });

    pgm.addConstraint('playlist_songs', 'unique_playlist_id_and_song_id', {
        unique: ['playlist_id', 'song_id'],
    });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.dropTable('playlist_songs');
};
