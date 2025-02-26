// src/pages/api/leetcode.js
export default async function handler(req, res) {
  const username = req.query.username || 'kianis4';
  const apiUrl = `https://leetcode-api-faisalshohag.vercel.app/${username}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch data from the API');
    }
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
}