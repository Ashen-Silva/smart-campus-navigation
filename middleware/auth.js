const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // Check if the request has an Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Access Denied: No Token Provided!" });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Verify the token
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_key');
        req.user = verified;
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        res.status(401).json({ message: "Invalid Token" });
    }
};

module.exports = authMiddleware;
