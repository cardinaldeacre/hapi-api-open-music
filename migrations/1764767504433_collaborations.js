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
    pgm.createTable('collaborations', {
        id: {
            type: 'VARCHAR(50)',
            primaryKey: true,
        },
        playlist_id: {
            type: 'VARCHAR(50)',
            notNull: true,
        },
        user_id: {
            type: 'VARCHAR(50)',
            notNull: true,
        },
    });

    pgm.addConstraint('collaborations', 'fk_collaborations.playlist_id_playlists.id', {
        foreignKeys: [{
            references: 'playlists',
            columns: 'playlist_id',
            onDelete: 'cascade',
        }],
    });

    pgm.addConstraint('collaborations', 'fk_collaborations.user_id_users.id', {
        foreignKeys: [{
            references: 'users',
            columns: 'user_id',
            onDelete: 'cascade',
        }],
    });

    pgm.addConstraint('collaborations', 'unique_playlist_id_and_user_id', {
        unique: ['playlist_id', 'user_id'],
    });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.dropTable('collaborations');
};
