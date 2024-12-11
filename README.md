
# Suley Fitness Portfolio

Welcome to the **Suley Fitness Portfolio**, a cutting-edge personal portfolio web application built with Next.js and styled with Tailwind CSS. This project showcases your fitness journey, achievements, and technical skills while integrating interactive features and a professional design to impress recruiters and hiring managers.

## Table of Contents
1. [Features](#features)
2. [Technologies Used](#technologies-used)
3. [Installation](#installation)
4. [Usage](#usage)
5. [Folder Structure](#folder-structure)
6. [Components Overview](#components-overview)
7. [API Integration](#api-integration)
8. [Contributing](#contributing)
9. [License](#license)

---

## Features

- **Responsive Design**: Tailwind CSS ensures seamless adaptability across devices.
- **Interactive Components**: Dynamic elements like carousels, cards, and buttons enhance user experience.
- **API Integration**: Data fetched from Instagram, Spotify (top artists and tracks), and other services to showcase fitness and lifestyle content.
- **Resume Downloads**: Multiple resume versions available for recruiters in a single click.
- **Modern Styling**: Clean and minimalistic UI powered by Tailwind CSS.
- **Performance-Optimized**: Built with Next.js for fast load times and optimized server-side rendering (SSR).
- **Content Customization**: Easily update sections, components, and layout to reflect your unique personal branding.

---

## Technologies Used

- **Next.js**: Framework for server-side rendering and static site generation.
- **React**: Core JavaScript library for building user interfaces.
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development.
- **JavaScript (ES6+)**: Modern JavaScript features for clean and efficient code.
- **API Integrations**:
  - **Instagram API**: Fetch and display Instagram media.
  - **Spotify API**: Show top tracks and artists.
- **HTML5 & CSS3**: For semantic structure and styling.

---

## Installation

To set up the project locally, follow these steps:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/SKompXcel/suley-fitness-portfolio.git
   cd suley-fitness-portfolio
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**:
   Create a `.env.local` file in the root directory and configure the following variables:
   ```plaintext
   INSTAGRAM_ACCESS_TOKEN=your_instagram_access_token
   SPOTIFY_CLIENT_ID=your_spotify_client_id
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
   ```

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to [http://localhost:3000](http://localhost:3000).

---

## Usage
- **Homepage**: Showcases a brief introduction, fitness highlights, and interactive carousels.
- **About Page**: Includes personal bio and fitness philosophy.
- **Resume Section**: Direct access to multiple resume files for downloading.
- **API-Powered Sections**: Dynamic media from Instagram and Spotify enhances content.
- **Social Media Links**: Direct buttons for easy navigation to personal social platforms.
- **Blog**: Features articles and posts about fitness, health, and personal experiences.

---

## Folder Structure

Here’s an overview of the repository structure:

```plaintext
suley-fitness-portfolio/
├── public/                # Public assets
│   └── rss/               # Resume files for download
├── src/
│   ├── components/        # Reusable React components
│   │   ├── ArticleLayout.jsx
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Carousel.jsx
│   │   ├── Container.jsx
│   │   ├── Footer.jsx
│   │   ├── Header.jsx
│   │   ├── Prose.jsx
│   │   ├── Section.jsx
│   │   ├── SimpleLayout.jsx
│   │   └── SocialIcons.jsx
│   ├── pages/             # Application pages
│   │   ├── api/           # API integrations
│   │   │   ├── instagram.js
│   │   │   ├── instagramMedia.js
│   │   │   ├── topArtists.js
│   │   │   └── topTracks.js
│   │   ├── about.jsx      # About page
│   │   └── _app.jsx       # Global application configuration
│   └── styles/            # Tailwind CSS configurations
└── README.md              # Project documentation
```

---

## Components Overview

### Key Components

1. **Header.jsx**:
   - Renders the site’s navigation bar and header content.
   - Fully responsive and styled with Tailwind CSS.

2. **Footer.jsx**:
   - Contains links to social media profiles and other relevant information.
   - Styled for a clean, modern appearance.

3. **Card.jsx**:
   - Displays information in an aesthetically pleasing card format.
   - Reusable across the site for achievements, skills, or project highlights.

4. **Carousel.jsx**:
   - A dynamic image or content slider to display fitness milestones or projects.

5. **SocialIcons.jsx**:
   - Customizable set of social media icons for easy navigation.

6. **ArticleLayout.jsx**:
   - Layout for blog-style content or detailed articles.

### Layout Components

- **Container.jsx**:
  - A responsive container for wrapping page content.
- **SimpleLayout.jsx**:
  - A straightforward layout for minimalist page design.
- **Prose.jsx**:
  - Optimized typography for rich text content.

---

## API Integration

The project includes robust integration with external APIs:

1. **Instagram API**:
   - Fetches and displays Instagram media to highlight fitness achievements.
   - File: `pages/api/instagramMedia.js`.

2. **Spotify API**:
   - Fetches top tracks and favorite artists to showcase your personality and interests.
   - Files: `pages/api/topTracks.js`, `pages/api/topArtists.js`.

---

## Contributing

Contributions are welcome! Here’s how you can contribute:

1. **Fork the Repository**:
   ```bash
   git fork https://github.com/SKompXcel/suley-fitness-portfolio.git
   ```

2. **Create a New Branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Commit Changes**:
   ```bash
   git commit -m "Add your feature"
   ```

4. **Push to Your Branch**:
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Submit a Pull Request**:
   Open a pull request on the original repository.

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

Feel free to update this README with any additional personal branding or information. Let me know if you’d like assistance customizing further!
