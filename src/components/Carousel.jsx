
'use client';

import React, { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import Image from 'next/image';

const Carousel = () => {
  const [media, setMedia] = useState([]); // State to hold Instagram media
  const [currentCard, setCurrentCard] = useState(0); // State for the carousel index
  const [loading, setLoading] = useState(true); // State for loading status
  const [error, setError] = useState(null); // State for errors

  // Fetch Instagram media when the component mounts
  useEffect(() => {
    const fetchInstagramMedia = async () => {
      try {
        const response = await fetch('/api/instagramMedia');
        const data = await response.json();

        if (data.error) {
          throw new Error(data.error.message || 'Failed to fetch Instagram media.');
        }

        setMedia(data.data || []); // Populate media state with API data
        setLoading(false); // Stop loading spinner
      } catch (err) {
        console.error('Error fetching Instagram media:', err);
        setError('Failed to load Instagram media. Please try again later.');
        setLoading(false); // Stop loading spinner
      }
    };

    fetchInstagramMedia();
  }, []);

  // Determine indices for the next and previous cards
  const nextIndex = (currentCard + 1) % media.length;
  const prevIndex = (currentCard - 1 + media.length) % media.length;

  // Handle mouse hover rotation for the current card
  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const centerPosition = {
      x: box.left + box.width / 2,
      y: box.top + box.height / 2,
    };
    const angle = Math.atan2(e.pageX - centerPosition.x, 0) * (35 / Math.PI);
    gsap.set(card, { '--current-card-rotation-offset': `${angle}deg` });
  };

  // Reset rotation when the mouse leaves the card
  const handleMouseLeave = (e) => {
    const card = e.currentTarget;
    gsap.set(card, { '--current-card-rotation-offset': 0 });
  };

  if (loading) {
    return <p className="text-white">Loading Instagram media...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (media.length === 0) {
    return <p className="text-white">No Instagram media found.</p>;
  }

  return (
    <div className="carousel_wrapper relative h-screen w-screen bg-black flex items-center justify-center overflow-hidden">
      {/* Backgrounds */}
      <div className="absolute inset-0">
        {media.map((item, index) => (
          <div
            key={item.id}
            className={`absolute w-full h-full transition-opacity duration-1000 ${
              index === currentCard ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backgroundImage: `url(${item.media_url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          ></div>
        ))}
      </div>

      {/* Cards */}
      <div className="relative flex items-center justify-center h-[400px] w-[800px]">
        {media.map((item, index) => (
          <div
            key={item.id}
            className={`absolute w-[200px] h-[300px] transition-transform duration-1000 ${
              index === currentCard
                ? 'z-30 scale-110'
                : index === prevIndex
                ? '-translate-x-[250px] z-20 scale-90'
                : index === nextIndex
                ? 'translate-x-[250px] z-20 scale-90'
                : 'opacity-0 z-10'
            }`}
            style={{
              transformOrigin: 'center',
              '--current-card-rotation-offset': '0deg',
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <div className="w-full h-full bg-white shadow-md rounded-lg overflow-hidden">
              <Image
                src={item.media_url}
                alt={item.caption || 'Instagram post'}
                className="w-full h-full object-cover"
                width={200}
                height={300}
                unoptimized
                priority
              />
            </div>
          </div>
        ))}
      </div>

      {/* Buttons */}
      <button
        onClick={() => setCurrentCard(prevIndex)}
        className="absolute top-1/2 left-5 -translate-y-1/2 p-2 bg-white rounded-full shadow-lg"
      >
        &larr;
      </button>
      <button
        onClick={() => setCurrentCard(nextIndex)}
        className="absolute top-1/2 right-5 -translate-y-1/2 p-2 bg-white rounded-full shadow-lg"
      >
        &rarr;
      </button>
    </div>
  );
};

export default Carousel;

// //src/components/Carousel.jsx
// 'use client';

// import React, { useState } from 'react';
// import { gsap } from 'gsap';
// import Image from 'next/image';

// // Placeholder data
// const placeholderImage =
//   'https://hips.hearstapps.com/hmg-prod/images/champagne-beach-espiritu-santo-island-vanuatu-royalty-free-image-1655672510.jpg?crop=0.668xw:1.00xh;0.167xw,0&resize=640:*';


// const data = [
//   {
//     name: 'Image 1',
//     user: '@user1',
//     description: 'Beautiful view of champagne beach.',
//     postDate: '2024-01-01',
//     imageSrc: "https://www.motortrend.com/files/667c8b6f08d8e8000842c179/001-2024-porsche-911-gt3rs-lead.jpg",
//   },
//   {
//     name: 'Image 2',
//     user: '@user2',
//     description: 'Another perspective of champagne beach.',
//     postDate: '2024-01-02',
//     imageSrc: placeholderImage,
//   },
//   {
//     name: 'Image 3',
//     user: '@user3',
//     description: 'Champagne beach at sunset.',
//     postDate: '2024-01-03',
//     imageSrc: "https://dealerinspire-image-library-prod.s3.us-east-1.amazonaws.com/images/l6aCms8TDUua5ADEc3Zl8bWFA03aEuZFYeDCohcb.jpg",
//   },
// ];

// const Carousel = () => {
  
//   const [currentCard, setCurrentCard] = useState(0);

//   // Determine indices for the next and previous cards
//   const nextIndex = (currentCard + 1) % data.length;
//   const prevIndex = (currentCard - 1 + data.length) % data.length;

//   // Handle mouse hover rotation for the current card
//   const handleMouseMove = (e) => {
//     const card = e.currentTarget;
//     const box = card.getBoundingClientRect();
//     const centerPosition = {
//       x: box.left + box.width / 2,
//       y: box.top + box.height / 2,
//     };
//     const angle = Math.atan2(e.pageX - centerPosition.x, 0) * (35 / Math.PI);
//     gsap.set(card, { '--current-card-rotation-offset': `${angle}deg` });
//   };

//   // Reset rotation when the mouse leaves the card
//   const handleMouseLeave = (e) => {
//     const card = e.currentTarget;
//     gsap.set(card, { '--current-card-rotation-offset': 0 });
//   };

//   return (
//     <div className="carousel_wrapper relative h-screen w-screen bg-black flex items-center justify-center overflow-hidden">
//       {/* Backgrounds */}
//       <div className="absolute inset-0">
//         {data.map((item, index) => (
//           <div
//             key={item.name}
//             className={`absolute w-full h-full transition-opacity duration-1000 ${
//               index === currentCard ? 'opacity-100' : 'opacity-0'
//             }`}
//             style={{
//               backgroundImage: `url(${item.imageSrc})`,
//               backgroundSize: 'cover',
//               backgroundPosition: 'center',
//             }}
//           ></div>
//         ))}
//       </div>

//       {/* Cards */}
//       <div className="relative flex items-center justify-center h-[400px] w-[800px]">
//         {data.map((item, index) => (
//           <div
//             key={item.name}
//             className={`absolute w-[200px] h-[300px] transition-transform duration-1000 ${
//               index === currentCard
//                 ? 'z-30 scale-110'
//                 : index === prevIndex
//                 ? '-translate-x-[250px] z-20 scale-90'
//                 : index === nextIndex
//                 ? 'translate-x-[250px] z-20 scale-90'
//                 : 'opacity-0 z-10'
//             }`}
//             style={{
//               transformOrigin: 'center',
//               '--current-card-rotation-offset': '0deg',
//             }}
//             onMouseMove={handleMouseMove}
//             onMouseLeave={handleMouseLeave}
//           >
//             <div className="w-full h-full bg-white shadow-md rounded-lg overflow-hidden">
//               <Image
//                 src={item.imageSrc}
//                 alt={item.name}
//                 className="w-full h-full object-cover"
//                 width={200}
//                 height={300}
//                 priority
//               />
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Buttons */}
//       <button
//         onClick={() => setCurrentCard(prevIndex)}
//         className="absolute top-1/2 left-5 -translate-y-1/2 p-2 bg-white rounded-full shadow-lg"
//       >
//         &larr;
//       </button>
//       <button
//         onClick={() => setCurrentCard(nextIndex)}
//         className="absolute top-1/2 right-5 -translate-y-1/2 p-2 bg-white rounded-full shadow-lg"
//       >
//         &rarr;
//       </button>
//     </div>
//   );
// };

// export default Carousel;