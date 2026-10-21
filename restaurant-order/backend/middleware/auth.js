const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
    try {
        const rawHeader = req.headers.authorization || req.headers.Authorization;
        let jwtToken;

        if (rawHeader && rawHeader.startsWith("Bearer ")) {
            jwtToken = rawHeader.split(" ")[1];
        } else if (req.cookies && req.cookies.token) {
            jwtToken = req.cookies.token;
        }

        if (!jwtToken) {
            return res.status(401).json({
                message: "Access denied. No token provided."
            });
        }

        const tokenPayload = jwt.verify(jwtToken, process.env.JWT_SECRET || "supersecretjwtkey123");
        req.user = tokenPayload;
        next();
    } catch (err) {
        return res.status(401).json({
            message: "Invalid or expired token."
        });
    }
};

const authorizeRoles = (...permittedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(401).json({
                message: "Unauthorized: User information missing."
            });
        }

        if (!permittedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Access denied. Role '${req.user.role}' is not authorized.`
            });
        }

        next();
    };
};

module.exports = {
    auth,
    authorizeRoles
};
