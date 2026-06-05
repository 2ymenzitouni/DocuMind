import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';

const validateJWT = async (req, res, next) => {
    try {
        const authorizationHeader = req.get('Authorization');

        if (!authorizationHeader) {
            return res.status(403).json({
                message: 'Authorization header was not provided'
            });
        }

        const parts = authorizationHeader.split(' ');

        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(403).json({
                message: 'Invalid authorization format'
            });
        }

        const token = parts[1];

        const payload = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const user = await userModel.findOne({
            email: payload.email
        });

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        req.user = user;
        next();

    } catch (error) {
        return res.status(403).json({
            message: 'Invalid or expired token'
        });
    }
};

export default validateJWT;