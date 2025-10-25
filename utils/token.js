import jwt from 'jsonwebtoken';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access_secret_key';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh_secret_key';

export const generateAccessToken = (user) => {
    return jwt.sign(
        { id: user.id },
        ACCESS_TOKEN_SECRET,
        { expiresIn: '60m' }
    );
};

export const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user.id },
        REFRESH_TOKEN_SECRET,
    );
};