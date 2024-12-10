import { topTracks } from '../../lib/spotify';

export default async function handler(req, res) {
  console.log('Handling /api/topTracks request');

  if (req.method === 'GET') {
    try {
      const response = await topTracks();
      const { items } = await response.json();

      const tracks = items.slice(0, 50).map((track) => ({
        title: track.name,
        coverImage: track.album.images[0]?.url,
        url: track.external_urls.spotify,
      }));

      res.status(200).json(tracks);
    } catch (error) {
      console.error('Error fetching top tracks:', error);
      res.status(500).json({ error: 'Failed to fetch top tracks' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
