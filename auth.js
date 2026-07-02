const jwt = require('jsonwebtoken');

const verifyAndCheckRole = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: "Access Denied. Please log in." });
    }

    try {
        // Verify the token
        const verified = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET || 'super_secret_key');
        req.user = verified;

        // Block guests from proceeding
        if (req.user.role === 'guest') {
            return res.status(403).json({ message: "Guests cannot update staff locations. Please sign up." });
        }

        next(); // User is verified and not a guest, proceed to the route
    } catch (error) {
        res.status(400).json({ message: "Invalid Token" });
    }
};

module.exports = verifyAndCheckRole;