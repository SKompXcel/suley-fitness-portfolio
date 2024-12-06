// src/pages/api/topArtists.js
import { topArtists } from '../../lib/spotify';

export default async function handler(req, res) {
  console.log('Handling /api/topArtists request');

  if (req.method === 'GET') {
    try {
      const response = await topArtists();
      const { items } = await response.json();

      const artists = items.slice(0, 50).map((artist) => ({
        title: artist.name,
        coverImage: artist.images[0]?.url,
        url: artist.external_urls.spotify,
      }));

      res.status(200).json(artists);
    } catch (error) {
      console.error('Error fetching top artists:', error);
      res.status(500).json({ error: 'Failed to fetch top artists' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}