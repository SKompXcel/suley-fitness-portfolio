// src/lib/spotify.js

const getAccessToken = async () => {

  const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN;

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
      ).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Spotify token error: ${data.error || 'Unknown error'}`);
  }
  return data;
};

export const topTracks = async () => {
  const { access_token } = await getAccessToken();
  console.log('Access token for topTracks:', access_token);

  return fetch("https://api.spotify.com/v1/me/top/tracks", {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
};

export const topArtists = async () => {
  const { access_token } = await getAccessToken();

  return fetch("https://api.spotify.com/v1/me/top/artists", {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
};

export const getUser = async () => {
  const { access_token } = await getAccessToken();
  console.log('Access token for getUser:', access_token);

  return fetch(`https://api.spotify.com/v1/users/${process.env.SPOTIFY_USER_NAME}`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
};

//   [
//     {
//         "title":"fukumean",
//         "artist":"Gunna",
//         "url":"https://open.spotify.com/track/4rXLjWdF2ZZpXCVTfWcshS",
//         "coverImage":{
//             "height":300,
//             "url":"https://i.scdn.co/image/ab67616d00001e02017d5e26552345c4b1575b6c",
//             "width":300
//         }
//     },
//     {
//         "title":"Sprinter",
//         "artist":"Dave, Central Cee",
//         "url":"https://open.spotify.com/track/2FDTHlrBguDzQkp7PVj16Q",
//         "coverImage":{
//             "height":300,
//             "url":"https://i.scdn.co/image/ab67616d00001e02e3a09a9ae3f1fa102c110e60",
//             "width":300
//         }
//     },
//     {"title":"500lbs","artist":"Lil Tecca","url":"https://open.spotify.com/track/6rjuKpPydT2SxN15TZpV7r","coverImage":{"height":300,"url":"https://i.scdn.co/image/ab67616d00001e02c4e6adea69105e6b6e214b96","width":300}},{"title":"Meridian","artist":"Dave, Tiakola","url":"https://open.spotify.com/track/73LBcJygFdRAiJfWkpnf2G","coverImage":{"height":300,"url":"https://i.scdn.co/image/ab67616d00001e02fb0239a3df5667586c83349f","width":300}},{"title":"Stories About My Brother","artist":"Drake","url":"https://open.spotify.com/track/0ZB5pdrM1leH58IgokDPZM","coverImage":{"height":300,"url":"https://i.scdn.co/image/ab67616d00001e02e286ee36b4015afa8832356a","width":300}}]