// middlewares/authenticationMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');

        const token = authHeader && authHeader.split(' ')[1];


        if (!token) {
            return res.status(401).json({ message: 'Unauthorized - Token not provided' });
        }

        var decoded

        jwt.verify(token, process.env.JWT_SECRET_KEY, (err, _decoded) => {
            if (err) {
                console.error('Token verification error:', err.name, err.message);
                return res.status(403).json({ error: 'Invalid token' });
            }

            decoded = _decoded;

            next();
        });


        try {
            console.log(`${decoded.user}`)
            const user = await User.findById(decoded.user);

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
