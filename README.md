# Suley Fitness Portfolio

Welcome to the Suley Fitness Portfolio, a cutting-edge personal portfolio web application built with Next.js and styled with Tailwind CSS. This project showcases your fitness journey, achievements, and technical skills while integrating interactive features and a professional design to impress recruiters and hiring managers.

## Table of Contents
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [Folder Structure](#folder-structure)
- [Components Overview](#components-overview)
- [API Integration](#api-integration)
- [Articles](#articles)
- [Spotify Viewer](#spotify-viewer)
- [Instagram Viewer](#instagram-viewer)
- [Contributing](#contributing)
- [License](#license)

## Features
- **Responsive Design**: Tailwind CSS ensures seamless adaptability across devices.
- **Interactive Components**: Dynamic elements like carousels, cards, and buttons enhance user experience.
- **API Integration**: Data fetched from Instagram, Spotify (top artists and tracks), and other services to showcase fitness and lifestyle content.
- **Resume Downloads**: Multiple resume versions available for recruiters in a single click.
- **Modern Styling**: Clean and minimalistic UI powered by Tailwind CSS.
- **Performance-Optimized**: Built with Next.js for fast load times and optimized server-side rendering (SSR).
- **Content Customization**: Easily update sections, components, and layout to reflect your unique personal branding.

## Technologies Used
- **Next.js**: Framework for server-side rendering and static site generation.
- **React**: Core JavaScript library for building user interfaces.
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development.
- **JavaScript (ES6+)**: Modern JavaScript features for clean and efficient code.
- **API Integrations**:
   - **Instagram API**: Fetch and display Instagram media.
   - **Spotify API**: Show top tracks and artists.
- **HTML5 & CSS3**: For semantic structure and styling.

## Installation
To set up the project locally, follow these steps:

1. **Clone the Repository**:
    ```bash
    git clone <repository-url>
    ```

2. **Install Dependencies**:
    ```bash
    cd suley-fitness-portfolio
    npm install
    ```

3. **Set Up Environment Variables**: Create a `.env.local` file in the root directory and configure the following variables:
    ```env
    NEXT_PUBLIC_INSTAGRAM_ACCESS_TOKEN=<your-instagram-access-token>
    NEXT_PUBLIC_SPOTIFY_CLIENT_ID=<your-spotify-client-id>
    NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET=<your-spotify-client-secret>
    ```

4. **Run the Development Server**:
    ```bash
    npm run dev
    ```

5. Open your browser and navigate to [http://localhost:3000](http://localhost:3000).

## Usage
- **Homepage**: Showcases a brief introduction, fitness highlights, and interactive carousels.
- **About Page**: Includes personal bio and fitness philosophy.
- **Resume Section**: Direct access to multiple resume files for downloading.
- **API-Powered Sections**: Dynamic media from Instagram and Spotify enhances content.
- **Social Media Links**: Direct buttons for easy navigation to personal social platforms.
- **Blog**: Features articles and posts about fitness, health, and personal experiences.

## Folder Structure
Here’s an overview of the repository structure:

```
/components
   Header.jsx
   Footer.jsx
   Card.jsx
   Carousel.jsx
   SocialIcons.jsx
   ArticleLayout.jsx
/pages
   api
      instagramMedia.js
      topTracks.js
      topArtists.js
   index.jsx
   about.jsx
   resume.jsx
   blog.jsx
   spotify.jsx
   instagram.jsx
/articles
   example-article.mdx
```

## Components Overview

### Key Components
- **Header.jsx**: Renders the site’s navigation bar and header content. Fully responsive and styled with Tailwind CSS.
- **Footer.jsx**: Contains links to social media profiles and other relevant information. Styled for a clean, modern appearance.
- **Card.jsx**: Displays information in an aesthetically pleasing card format. Reusable across the site for achievements, skills, or project highlights.
- **Carousel.jsx**: A dynamic image or content slider to display fitness milestones or projects.
- **SocialIcons.jsx**: Customizable set of social media icons for easy navigation.
- **ArticleLayout.jsx**: Layout for blog-style content or detailed articles.

### Layout Components
- **Container.jsx**: A responsive container for wrapping page content.
- **SimpleLayout.jsx**: A straightforward layout for minimalist page design.
- **Prose.jsx**: Optimized typography for rich text content.

## API Integration
The project includes robust integration with external APIs:

### Instagram API
Fetches and displays Instagram media to highlight fitness achievements.
- **File**: `pages/api/instagramMedia.js`

### Spotify API
Fetches top tracks and favorite artists to showcase your personality and interests.
- **Files**: `pages/api/topTracks.js`, `pages/api/topArtists.js`

## Articles
The articles section is designed to showcase blog posts and articles about fitness, health, and personal experiences.

### Structure
- **Article Pages**: Each article is written in MDX format and stored in the `articles` directory.
- **Article Layout**: The `ArticleLayout.jsx` component is used to render the articles with a consistent layout.

### Example
```md
---
title: "My Fitness Journey"
date: "2023-01-01"
---

# My Fitness Journey
This is an example article about my fitness journey...
```

## Spotify Viewer
The Spotify viewer fetches and displays the user's top tracks and favorite artists using the Spotify API.

### Structure
- **API Integration**: The `topTracks.js` and `topArtists.js` files handle the API requests to Spotify.
- **Spotify Page**: The `spotify.jsx` file renders the Spotify viewer page.

### Example
```jsx
import { useEffect, useState } from 'react';
import axios from 'axios';

const SpotifyViewer = () => {
   const [topTracks, setTopTracks] = useState([]);

   useEffect(() => {
      const fetchTopTracks = async () => {
         const response = await axios.get('/api/topTracks');
         setTopTracks(response.data);
      };
      fetchTopTracks();
   }, []);

   return (
      <div>
         <h1>My Top Tracks</h1>
         <ul>
            {topTracks.map(track => (
               <li key={track.id}>{track.name}</li>
            ))}
         </ul>
      </div>
   );
};

export default SpotifyViewer;
```

## Instagram Viewer
The Instagram viewer fetches and displays the user's Instagram media using the Instagram API.

### Structure
- **API Integration**: The `instagramMedia.js` file handles the API requests to Instagram.
- **Instagram Page**: The `src/pages/instagram.jsx` file renders the Instagram viewer page.

### Example
```jsx
import { useEffect, useState } from 'react';
import axios from 'axios';

const InstagramViewer = () => {
   const [media, setMedia] = useState([]);

   useEffect(() => {
      const fetchMedia = async () => {
         const response = await axios.get('/api/instagramMedia');
         setMedia(response.data);
      };
      fetchMedia();
   }, []);

   return (
      <div>
         <h1>My Instagram Media</h1>
         <ul>
            {media.map(item => (
               <li key={item.id}>
                  <img src={item.media_url} alt={item.caption} />
               </li>
            ))}
         </ul>
      </div>
   );
};

export default InstagramViewer;
```

## Contributing
Contributions are welcome! Here’s how you can contribute:

1. **Fork the Repository**:
    ```bash
    git fork <repository-url>
    ```

2. **Create a New Branch**:
    ```bash
    git checkout -b feature/your-feature-name
    ```

3. **Commit Changes**:
    ```bash
    git commit -m "Add your message here"
    ```

4. **Push to Your Branch**:
    ```bash
    git push origin feature/your-feature-name
    ```

5. **Submit a Pull Request**: Open a pull request on the original repository.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

Feel free to update this README with any additional personal branding or information. Let me know if you’d like assistance customizing further!