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
        <h1 className="text-5xl font-extrabold text-center mb-6 text-gray-800 dark:text-zinc-100">
        My Top Spotify Artists
        </h1>
        <p className="text-lg text-center text-gray-600 mb-8 dark:text-zinc-400">
        A personalized showcase of my favorite artists, powered by the Spotify API. 
        Discover the music that inspires me!
        </p>
      {error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 ">
          {artists.map((artist, index) => (
            <div
              key={index}
              className="artist-card flex flex-col items-center bg-white shadow-lg rounded-lg p-4 dark:bg-zinc-800"
            >
              <h2 className="text-xl font-semibold text-center mb-2 dark:text-zinc-100">
                {artist.title}
              </h2>
              <Image
                src={artist.coverImage}
                alt={artist.title}
                width={300}
                height={300}
                className="w-full h-auto rounded-md mb-4"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SpotifyPage;


