// /src/lib/instagramMedia.js
import fetch from 'node-fetch';

import { fetchInstagramMedia } from '@/lib/fetchInstagram';


export default async function handler(req, res) {
  try {
    const media = await fetchInstagramMedia(); // Fetch media data using the lib function
    res.status(200).json(media); // Respond with the fetched media
  } catch (error) {
    console.error('Error in /api/instagramMedia:', error.message);
    res.status(500).json({ error: 'Failed to fetch Instagram media' });
  }
}