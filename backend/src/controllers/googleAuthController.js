import User from '../models/User.js';
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken.js';

// Google OAuth callback
export const googleCallback = async (req, res) => {
    try {
        const user = req.user;

        // Generate tokens
        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        // Redirect to frontend with tokens
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        res.redirect(
            `${clientUrl}/auth/callback?` +
            `access_token=${accessToken}&` +
            `refresh_token=${refreshToken}&` +
            `user=${encodeURIComponent(JSON.stringify({
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                role: user.role
            }))}`
        );
    } catch (error) {
        console.error('Google callback error:', error);
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        res.redirect(`${clientUrl}/login?error=auth_failed`);
    }
};
