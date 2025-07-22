import User from "../models/User.js";

// Middleware to check if user is authenticated
export const protect = async (req, res, next) => {
    try {
        const { userId } = req.auth;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Not authenticated" });
        }
        else{
            const user = await User.findById(userId);
            req.user = user;
            next();
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};