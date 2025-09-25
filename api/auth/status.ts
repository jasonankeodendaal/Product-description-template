import type { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';
import cookie from 'cookie';

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
        return res.status(500).json({ error: "Google credentials are not configured." });
    }

    const cookies = cookie.parse(req.headers.cookie || '');
    const tokens = cookies.google_tokens ? JSON.parse(cookies.google_tokens) : null;

    if (!tokens) {
        return res.status(200).json({ connected: false });
    }

    try {
        const oauth2Client = new google.auth.OAuth2(
            GOOGLE_CLIENT_ID,
            GOOGLE_CLIENT_SECRET
        );
        oauth2Client.setCredentials(tokens);

        // Make a simple API call to verify the token is valid
        const oauth2 = google.oauth2({
            auth: oauth2Client,
            version: 'v2',
        });
        const userInfo = await oauth2.userinfo.get();
        
        if (userInfo.data.email) {
            return res.status(200).json({ connected: true, email: userInfo.data.email });
        } else {
            return res.status(200).json({ connected: false });
        }
    } catch (error) {
        console.error("Error verifying token:", error);
        // This could happen if the token expired or was revoked
        return res.status(200).json({ connected: false });
    }
}
