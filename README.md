# MagnetDemon

A modern, responsive BitTorrent interface built with Next.js and Torrust.

![MagnetDemon Interface](https://i.imgur.com/ik8F4zR.png)
*This screenshot contains only mock data and does not represent real torrents, release groups, or actual content.*

## ⚠️ Disclaimer

**THIS PROJECT IS FOR EDUCATIONAL PURPOSES ONLY**

MagnetDemon is designed as a learning resource for understanding modern web development with Next.js and BitTorrent technologies. Please note:

1. This is NOT secure for production use out-of-the-box
2. The application includes simplified authentication mechanisms meant for demonstration only
3. Proper security measures would need to be implemented for any real-world deployment
4. Users are responsible for ensuring they respect copyright laws and intellectual property rights
5. The developers do not condone or encourage copyright infringement or piracy

## 🚀 Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS, Shadcn UI
- **Backend**: Torrust Index & Tracker APIs
- **Authentication**: JWT (simplified implementation)
- **Database**: PostgreSQL (via Docker)
- **Containerization**: Docker & Docker Compose
- **Package Manager**: Bun

## 🔧 Setup & Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Bun](https://bun.sh/) package manager
- [Docker](https://www.docker.com/) and Docker Compose
- [TMDB API Key](https://developer.themoviedb.org/docs) (for movie/TV show metadata)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/juddisjudd/magnet-demon.git
   cd magnet-demon
   ```

2. Configure environment variables
   Create a `.env.local` file with the following:
   ```
   NEXT_PUBLIC_USE_MOCK_DATA=true  # Set to 'false' to use actual Torrust backend
   NEXT_PUBLIC_TORRUST_INDEX_URL=http://localhost:3001/api
   NEXT_PUBLIC_TORRUST_TRACKER_URL=http://localhost:7070/api
   TORRUST_TRACKER_USERNAME=admin
   TORRUST_TRACKER_PASSWORD=password
   JWT_SECRET=your-secure-jwt-secret
   TMDB_API_KEY=your-tmdb-api-key
   ```

3. Run the setup script
   ```bash
   # On Windows
   ./setup.ps1
   
   # On Linux/Mac
   ./setup.sh
   ```

Alternatively, set up manually:

1. Start Docker containers:
   ```bash
   docker-compose up -d
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Start the development server:
   ```bash
   bun dev
   ```

4. Access the application at [http://localhost:3000](http://localhost:3000)

## 🔐 Login Credentials (Development Only)

- **Admin User**: 
  - Username: `admin`
  - Password: `admin123`
- **Regular User**:
  - Username: `user`
  - Password: `user123`

⚠️ These credentials are hardcoded for development purposes only. In a production environment, you would implement proper user authentication.

## 🎉 Features

- Modern, responsive UI with dark/light mode
- Search and browse torrents with advanced filtering
- View detailed torrent information with TMDb integration
- Upload new torrents with metadata
- User profiles and settings management
- Admin controls (for admin users)

## ❤️ Credits

This project heavily relies on and is built upon:
- [Torrust](https://github.com/torrust/torrust) - An open-source BitTorrent index and tracker
- [Next.js](https://nextjs.org/) - The React framework for production
- [shadcn/ui](https://ui.shadcn.com/) - Re-usable UI components
- [TMDb API](https://www.themoviedb.org/documentation/api) - For movie and TV show metadata

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.
