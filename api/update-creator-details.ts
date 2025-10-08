
import type { VercelRequest, VercelResponse } from '@vercel/node';

// This is a new API endpoint to securely update the global creator details.
// It uses a GitHub Gist as a simple, serverless JSON store.

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // --- Environment Variable and Secret Validation ---
  const { GIST_ID, GIST_PAT, CREATOR_PIN } = process.env;
  if (!GIST_ID || !GIST_PAT || !CREATOR_PIN) {
    console.error("Server is missing required environment variables: GIST_ID, GIST_PAT, CREATOR_PIN");
    return res.status(500).json({ error: 'Server configuration is incomplete.' });
  }
  
  const { details, pin } = req.body;

  // --- Authentication ---
  if (pin !== CREATOR_PIN) {
    return res.status(401).json({ error: 'Unauthorized: Incorrect PIN.' });
  }

  if (!details) {
    return res.status(400).json({ error: 'Missing creator details in request body.' });
  }

  const gistApiUrl = `https://api.github.com/gists/${GIST_ID}`;

  try {
    const response = await fetch(gistApiUrl, {
      method: 'PATCH',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `Bearer ${GIST_PAT}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: `Creator Details for AI Tools App - Updated ${new Date().toISOString()}`,
        files: {
          'creator_details.json': {
            content: JSON.stringify(details, null, 2),
          },
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to update Gist:", errorData);
      throw new Error(`GitHub API responded with status ${response.status}: ${errorData.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return res.status(200).json({ success: true, message: 'Global creator details updated successfully.', url: data.html_url });

  } catch (error) {
    console.error('Server-side error in /api/update-creator-details:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred.';
    return res.status(500).json({ error: errorMessage });
  }
}