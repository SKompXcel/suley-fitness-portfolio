// /src/components/Carousel.jsx
"use client";
import { Header } from "@/components/Header";
import React, { useState, useEffect } from "react";
import { gsap } from "gsap";
import Image from "next/image";

const Carousel = () => {
  const [media, setMedia] = useState([]); // State to hold Instagram media
  const [currentCard, setCurrentCard] = useState(0); // State for the carousel index
  const [loading, setLoading] = useState(true); // State for loading status
  const [error, setError] = useState(null); // State for errors

  // Fetch Instagram media when the component mounts
  useEffect(() => {
    const fetchInstagramMedia = async () => {
      try {
        const response = await fetch("/api/instagramMedia");
        const data = await response.json();

        if (data.error) {
          throw new Error(data.error.message || "Failed to fetch Instagram media.");
        }

        setMedia(data.data || []); // Populate media state with API data
        setLoading(false); // Stop loading spinner
      } catch (err) {
        console.error("Error fetching Instagram media:", err);
        setError("Failed to load Instagram media. Please try again later.");
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
    gsap.set(card, { "--current-card-rotation-offset": `${angle}deg` });
  };

  // Reset rotation when the mouse leaves the card
  const handleMouseLeave = (e) => {
    const card = e.currentTarget;
    gsap.set(card, { "--current-card-rotation-offset": 0 });
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
    <div className="relative h-screen w-full overflow-hidden">
      <Header />
  
      {/* API Description */}
      <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-20 text-center p-4 bg-black/50 rounded-lg max-w-[90%] md:max-w-[70%] mt-10">
        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-100">
          My Instagram Posts:
        </h1>
        <p className="text-sm md:text-lg text-gray-300 mt-2">
          A personalized showcase of my favorite Instagram posts, powered by the Instagram API.
        </p>
      </div>
  
      {/* Background */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center blur-sm"
        style={{
          backgroundImage: `url(${media[currentCard]?.media_url})`,
        }}
      ></div>
  
      {/* Carousel Wrapper */}
      <div className="relative z-10 h-full w-full flex items-center justify-center">
        {/* Cards */}
        <div className="relative flex items-center justify-center h-[400px] w-[800px]">
          {media.map((item, index) => (
            <div
              key={item.id}
              className={`absolute w-[200px] h-[300px] transition-transform duration-1000 ${
                index === currentCard
                  ? "z-30 scale-110"
                  : index === prevIndex
                  ? "-translate-x-[250px] z-20 scale-90"
                  : index === nextIndex
                  ? "translate-x-[250px] z-20 scale-90"
                  : "opacity-0 z-10"
              }`}
              style={{
                transformOrigin: "center",
                "--current-card-rotation-offset": "0deg",
              }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <div className="w-full h-full bg-white shadow-md rounded-lg overflow-hidden">
                <Image
                  src={item.media_url}
                  alt={item.caption || "Instagram post"}
                  className="w-full h-full object-cover"
                  width={200}
                  height={300}
                  unoptimized
                  priority
                />
              </div>
  
              {/* Caption Below Image */}
              <div className="mt-4 text-center text-sm text-gray-100 bg-black/50 p-2 rounded-md mx-auto max-w-[80%]">
                {item.caption || "No caption available"}
              </div>
            </div>
          ))}
        </div>
  
        {/* Navigation Buttons */}
        <button
          onClick={() => setCurrentCard(prevIndex)}
          className="absolute top-1/2 left-5 -translate-y-1/2 p-2 bg-white rounded-full shadow-lg z-20"
        >
          &larr;
        </button>
        <button
          onClick={() => setCurrentCard(nextIndex)}
          className="absolute top-1/2 right-5 -translate-y-1/2 p-2 bg-white rounded-full shadow-lg z-20"
        >
          &rarr;
        </button>
      </div>
    </div>
  );
};

export default Carousel;

// "use client";
// import { Header } from '@/components/Header'
// import React, { useState, useEffect } from "react";
// import { gsap } from "gsap";
// import Image from "next/image";

// const Carousel = () => {
//   const [media, setMedia] = useState([]); // State to hold Instagram media
//   const [currentCard, setCurrentCard] = useState(0); // State for the carousel index
//   const [loading, setLoading] = useState(true); // State for loading status
//   const [error, setError] = useState(null); // State for errors

//   // Fetch Instagram media when the component mounts
//   useEffect(() => {
//     const fetchInstagramMedia = async () => {
//       try {
//         const response = await fetch("/api/instagramMedia");
//         const data = await response.json();

//         if (data.error) {
//           throw new Error(data.error.message || "Failed to fetch Instagram media.");
//         }

//         setMedia(data.data || []); // Populate media state with API data
//         setLoading(false); // Stop loading spinner
//       } catch (err) {
//         console.error("Error fetching Instagram media:", err);
//         setError("Failed to load Instagram media. Please try again later.");
//         setLoading(false); // Stop loading spinner
//       }
//     };

//     fetchInstagramMedia();
//   }, []);

//   // Determine indices for the next and previous cards
//   const nextIndex = (currentCard + 1) % media.length;
//   const prevIndex = (currentCard - 1 + media.length) % media.length;

//   // Handle mouse hover rotation for the current card
//   const handleMouseMove = (e) => {
//     const card = e.currentTarget;
//     const box = card.getBoundingClientRect();
//     const centerPosition = {
//       x: box.left + box.width / 2,
//       y: box.top + box.height / 2,
//     };
//     const angle = Math.atan2(e.pageX - centerPosition.x, 0) * (35 / Math.PI);
//     gsap.set(card, { "--current-card-rotation-offset": `${angle}deg` });
//   };

//   // Reset rotation when the mouse leaves the card
//   const handleMouseLeave = (e) => {
//     const card = e.currentTarget;
//     gsap.set(card, { "--current-card-rotation-offset": 0 });
//   };

//   if (loading) {
//     return <p className="text-white">Loading Instagram media...</p>;
//   }

//   if (error) {
//     return <p className="text-red-500">{error}</p>;
//   }

//   if (media.length === 0) {
//     return <p className="text-white">No Instagram media found.</p>;
//   }

//   return (
//     <div className="relative h-screen w-full overflow-hidden">
// <Header/>  
//       {/* Carousel Wrapper */}
//       <div className="carousel_wrapper relative h-full w-full flex items-center justify-center">
//         {/* Dynamic Background */}
//         <div
//           className="absolute inset-0 z-0 bg-cover bg-center blur-sm"
//           style={{
//             backgroundImage: `url(${media[currentCard]?.media_url})`,
//           }}
//         ></div>
  
//         {/* Cards */}
//         <div className="relative flex items-center justify-center h-[400px] w-[800px] z-10">
//           {media.map((item, index) => (
//             <div
//               key={item.id}
//               className={`absolute w-[200px] h-[300px] transition-transform duration-1000 ${
//                 index === currentCard
//                   ? "z-30 scale-110"
//                   : index === prevIndex
//                   ? "-translate-x-[250px] z-20 scale-90"
//                   : index === nextIndex
//                   ? "translate-x-[250px] z-20 scale-90"
//                   : "opacity-0 z-10"
//               }`}
//               style={{
//                 transformOrigin: "center",
//                 "--current-card-rotation-offset": "0deg",
//               }}
//               onMouseMove={handleMouseMove}
//               onMouseLeave={handleMouseLeave}
//             >
//               <div className="w-full h-full bg-white shadow-md rounded-lg overflow-hidden">
//                 <Image
//                   src={item.media_url}
//                   alt={item.caption || "Instagram post"}
//                   className="w-full h-full object-cover"
//                   width={200}
//                   height={300}
//                   unoptimized
//                   priority
//                 />
//               </div>
//             </div>
//           ))}
//         </div>
  
//         {/* Navigation Buttons */}
//         <button
//           onClick={() => setCurrentCard(prevIndex)}
//           className="absolute top-1/2 left-5 -translate-y-1/2 p-2 bg-white rounded-full shadow-lg z-20"
//         >
//           &larr;
//         </button>
//         <button
//           onClick={() => setCurrentCard(nextIndex)}
//           className="absolute top-1/2 right-5 -translate-y-1/2 p-2 bg-white rounded-full shadow-lg z-20"
//         >
//           &rarr;
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Carousel;
