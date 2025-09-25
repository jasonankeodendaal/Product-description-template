import type { VercelRequest, VercelResponse } from '@vercel/node';
import cookie from 'cookie';

export default function handler(req: VercelRequest, res: VercelResponse) {
    // Clear the cookie by setting its expiration date to the past
    res.setHeader('Set-Cookie', cookie.serialize('google_tokens', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        expires: new Date(0),
        sameSite: 'lax',
        path: '/',
    }));

    res.status(200).json({ message: 'Successfully disconnected.' });
}
