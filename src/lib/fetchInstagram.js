const INSTAGRAM_GRAPH_API_URL = 'https://graph.instagram.com';

export const fetchInstagramMedia = async () => {
    try {
      const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
      if (!accessToken) {
        throw new Error('Instagram access token is missing. Check your .env.local file.');
      }
  
      const url = `${INSTAGRAM_GRAPH_API_URL}/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&access_token=${accessToken}`;
  
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch Instagram media: ${response.statusText}`);
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching Instagram media:', error.message);
      throw error;
    }
  };