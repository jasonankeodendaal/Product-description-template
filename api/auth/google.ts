import type { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';

const {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    NEXTAUTH_URL
} = process.env;

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !NEXTAUTH_URL) {
        return res.status(500).json({ error: "Google credentials are not configured on the server." });
    }

    const oauth2Client = new google.auth.OAuth2(
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        `${NEXTAUTH_URL}/api/auth/google/callback`
    );

    // Define the scopes required for Google Drive access
    const scopes = [
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
    ];

    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline', // Important to get a refresh token
        scope: scopes,
        prompt: 'consent', // Force consent screen to ensure refresh token is sent
    });

    res.redirect(url);
}
