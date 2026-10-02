import jwt from 'jsonwebtoken'

function authMiddleware(req, res, next) {

    
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({
            message: 'no token provided'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;

        next();

    } catch (error) {

        return res.status(401).json({
            message: 'invalid token'
        });
    }

}
export default authMiddleware