const pool = require('./PgPool')
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const InvariantError = require('../exception/InvariantError')
const NotFoundError = require('../exception/NotFoundError');
const AuthenticationError = require('../exception/AuthenticationError');

class UsersService {
    constructor() {
        this._pool = pool;
    }

    async addUser({ username, password, fullname }) {
        await this.verifyNewUsername(username);

        const id = `user-${nanoid(16)}`;
        const hasheddPassword = await bcrypt.hash(password, 11);

        const query = {
            text: 'INSERT INTO users VALUES($1, $2, $3, $4) RETURNING id',
            values: [id, username, hasheddPassword, fullname],
        }

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new InvariantError('User gagal ditabmahkan');
        }

        return result.rows[0].id;
    }

    async verifyNewUsername(username) {
        const query = {
            text: 'SELECT username FROM users WHERE username = $1',
            values: [username],
        }

        const result = await this._pool.query(query);

        if (result.rows.length > 0) {
            throw new InvariantError('Username sudah digunaakan');
        }
    }

    async verifyUserCredential(username, password) {
        const query = {
            text: 'SELECT id, password FROM users WHERE username = $1',
            values: [username],
        }
        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new AuthenticationError('Username atau password salah')
        }

        const { id, password: hasheddPassword } = result.rows[0];
        const match = await bcrypt.compare(password, hasheddPassword);

        if (!match) {
            throw new AuthenticationError('Password salah')
        }

        return id;
    }

    async getUserById(id) {
        const query = {
            text: 'SELECT id, username, fullname FROM users WHERE id = $1',
            values: [id],
        }

        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new NotFoundError('User tidak ditemukan')
        }

        return result.rows[0];
    }
}

module.exports = UsersService;