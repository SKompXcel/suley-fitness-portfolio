// /src/pages/instagramMedia.jsx

'use client';

import dynamic from 'next/dynamic';

// Dynamically import the Carousel component with SSR disabled
const Carousel = dynamic(() => import('@/components/Carousel'), { ssr: false });

export default function InstagramMedia() {
  return (
    <main className="flex justify-center items-center h-screen bg-black">
      <Carousel />
    </main>
  );
}