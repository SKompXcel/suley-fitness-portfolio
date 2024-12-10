// src/pages/api/instagram.js

const BASE_URL = 'https://graph.instagram.com';

export default async function handler(req, res) {
  const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!ACCESS_TOKEN) {
    return res.status(500).json({ error: 'Instagram access token is missing.' });
  }

  if (req.method === 'GET') {
    try {
      const { query } = req;
      const { type } = query; // Use `type` to differentiate requests for profile or media

      let url = '';
      if (type === 'profile') {
        // Endpoint to fetch user profile
        url = `${BASE_URL}/me?fields=id,username,account_type&access_token=${ACCESS_TOKEN}`;
      } else if (type === 'media') {
        // Endpoint to fetch media posts
        url = `${BASE_URL}/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp&access_token=${ACCESS_TOKEN}`;
      } else {
        return res.status(400).json({ error: 'Invalid query parameter. Use "type=profile" or "type=media".' });
      }

      const response = await fetch(url);

      if (!response.ok) {
        const error = await response.json();
        return res.status(response.status).json({ error });
      }

      const data = await response.json();
      return res.status(200).json(data);
    } catch (error) {
      console.error('Error fetching Instagram data:', error);
      return res.status(500).json({ error: 'Failed to fetch Instagram data.' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

// How to Use

// Fetch Profile Data

// Make a GET request to:

// http://localhost:3000/api/instagram?type=profile

// Fetch Media Posts

// Make a GET request to:

// http://localhost:3000/api/instagram?type=media