'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const SpotifyPage = () => {
  const [artists, setArtists] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const response = await fetch('/api/topArtists');
        if (!response.ok) {
          throw new Error('Failed to fetch top artists');
        }
        const data = await response.json();
        setArtists(data);
      } catch (error) {
        console.error('Error fetching artists:', error);
        setError('Could not load top artists. Please try again later.');
      }
    };

    fetchArtists();
  }, []);

  return (
    <div className="spotify-page flex flex-col items-center p-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        My Top Spotify Artists
      </h1>
      {error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {artists.map((artist, index) => (
            <div
              key={index}
              className="artist-card flex flex-col items-center bg-white shadow-lg rounded-lg p-4"
            >
              <h2 className="text-xl font-semibold text-center mb-2">
                {artist.title}
              </h2>
              <Image
                src={artist.coverImage}
                alt={artist.title}
                width={300}
                height={300}
                className="w-full h-auto rounded-md mb-4"
              />
              <a
                href={artist.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline hover:text-blue-700"
              >
                Listen on Spotify
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SpotifyPage;


