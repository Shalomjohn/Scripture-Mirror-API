// middlewares/authenticationMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authenticate = async (req, res, next) => {
    try {
        const bearerToken = req.header('Authorization');

        const token = bearerToken.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized - Token not provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        try {
            const user = await User.findById(decoded.id);

            if (!user) {
                return res.status(401).json({ message: 'Unauthorized - Invalid token' });
            }

            if (user) {
                req.user = user;
            }

        } catch (e) {
            console.log(e);
            return res.status(401).json({ message: e.message });
        }

        next();
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error });
    }
};

module.exports = { authenticate };
