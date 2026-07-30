const jwt = require("jsonwebtoken");

exports.auth = (req, res, next) => {
    try {
        const token = req.headers.token || (req.header("Authorization") && req.header("Authorization").replace("Bearer ", "")) || req.cookies?.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (err) {
        return res.status(401).json({
            success: false,
            message: "Invalid token"
        });
    }
}