import type { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';
import cookie from 'cookie';

const {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    NEXTAUTH_URL
} = process.env;

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !NEXTAUTH_URL) {
        return res.status(500).json({ error: "Google credentials are not configured." });
    }

    const { code } = req.query;

    if (typeof code !== 'string') {
        return res.status(400).json({ error: "Authorization code is missing." });
    }

    try {
        const oauth2Client = new google.auth.OAuth2(
            GOOGLE_CLIENT_ID,
            GOOGLE_CLIENT_SECRET,
            `${NEXTAUTH_URL}/api/auth/google/callback`
        );

        const { tokens } = await oauth2Client.getToken(code);
        
        // Store the tokens securely in an httpOnly cookie
        res.setHeader('Set-Cookie', cookie.serialize('google_tokens', JSON.stringify(tokens), {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            maxAge: 60 * 60 * 24 * 30, // 30 days
            sameSite: 'lax',
            path: '/',
        }));

        // Redirect user back to the dashboard
        res.redirect('/');

    } catch (error) {
        console.error("Error exchanging code for tokens:", error);
        res.status(500).json({ error: 'Failed to authenticate with Google.' });
    }
}