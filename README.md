# Manga API

A RESTful API for scraping manga data from MangaBat.

## Endpoints

### Search Manga
- `GET /api/manga/search/:query?/:page?`
- Search for manga by title
- Parameters:
  - query (optional): Search term (default: "attack on titan")
  - page (optional): Page number (default: 1)

### Get Manga Details
- `GET /api/manga/details/:id`
- Get detailed information about a specific manga

### Read Chapter
- `GET /api/manga/read/:mangaId?/:chapterId?`
- Get chapter images for reading

### Browse Manga
- `GET /api/manga/latest/:page?` - Get latest manga updates
- `GET /api/manga/popular/:page?` - Get popular manga
- `GET /api/manga/popular-this-month` - Get popular manga from current month
- `GET /api/manga/newest/:page?` - Get newest manga
- `GET /api/manga/completed/:page?` - Get completed manga
- Parameters:
  - page (optional): Page number (default: 1) (not applicable for popular-this-month)

## Installation

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Start the server:
\`\`\`bash
npm start
\`\`\`

For development with auto-reload:
\`\`\`bash
npm run dev
\`\`\`

The API will be available at http://localhost:3000
