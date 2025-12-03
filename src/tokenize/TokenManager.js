const Jwt = require('@hapi/jwt');
const InvariantError = require('../exception/InvariantError');

const TokenManager = {
    generateAccessToken: (payload) => Jwt.token.generate(payload, process.env.ACCESS_TOKEN_KEY),
    generataRefreshToken: (payload) => Jwt.token.generate(payload, process.env.REFRESH_TOKEN_KEY),

    verifyRefreshToken: (refreshToken) => {
        try {
            const data = Jwt.token.decode(refreshToken);

            Jwt.token.verifySignature(data, process.env.REFRESH_TOKEN_KEY)

            const { payload } = data
            return payload;
        } catch (error) {
            throw new InvariantError('Refresh token tidak valid');
        }
    }
}

module.exports = TokenManager;