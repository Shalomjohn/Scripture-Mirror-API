// middlewares/authenticationMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authenticate = async (req, res, next) => {
    try {
        const bearerToken = req.header('Authorization');

        if (!bearerToken) {
            return res.status(401).json({ message: 'Unauthorized - No token provided', code: 'NO_TOKEN' });
        }

        const token = bearerToken.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized - Token not properly provided', code: 'INVALID_TOKEN_FORMAT' });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        } catch (jwtError) {
            if (jwtError.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Session expired. Please login again.', code: 'TOKEN_EXPIRED' });
            }
            if (jwtError.name === 'JsonWebTokenError') {
                return res.status(401).json({ message: 'Invalid token. Please login again.', code: 'INVALID_TOKEN' });
            }
            return res.status(401).json({ message: 'Authentication failed', code: 'AUTH_FAILED' });
        }

        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ message: 'User not found. Please login again.', code: 'USER_NOT_FOUND' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.log('Auth middleware error:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

module.exports = { authenticate };
