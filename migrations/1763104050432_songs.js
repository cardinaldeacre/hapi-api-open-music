/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = pgm => {
	pgm.createTable('songs', {
		id: {
			type: 'VARCHAR(50)',
			primaryKey: true,
		},
		title: {
			type: 'TEXT',
			notNull: true,
		},
		year: {
			type: 'INTEGER',
			notNull: true,
		},
		performer: {
			type: 'TEXT',
			notNull: true,
		},
		genre: {
			type: 'TEXT',
			notNull: true,
		},
		duration: {
			type: 'INTEGER',
			default: null,
		},
		album_id: {
			type: 'VARCHAR(50)',
			default: null,
		},
		created_at: {
			type: 'TEXT',
			notNull: true,
		},
		updated_at: {
			type: 'TEXT',
			notNull: true,
		},
	});
	// constarinn
	pgm.addConstraint(
		'songs',
		'fk_songs.album_id_albums.id',
		'FOREIGN KEY(album_id) REFERENCES albums(id) ON DELETE CASCADE'
	);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = pgm => {
	pgm.dropTable('songs');
};
