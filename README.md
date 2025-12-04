# TechLand - Digital Devices, Repair Services & Courses Platform

![TechLand](https://img.shields.io/badge/TechLand-v2.0.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)

A modern e-commerce platform for digital devices (smartphones & laptops), repair services, and phone repair courses.

## 🚀 Features

- **Products**: Smartphones and laptops with detailed specifications
- **Services**: Device repair services with online booking
- **Courses**: Phone repair training courses
- **Authentication**: JWT-based authentication with refresh tokens
- **Cart**: Unified cart for products, services, and courses
- **Payments**: Multiple payment methods support
- **Profile**: User dashboard with order history, enrolled courses, and service reservations
- **Docker**: Full containerization with PostgreSQL

## 🛠️ Tech Stack

- **Backend**: Node.js with Express 5
- **Database**: PostgreSQL 16
- **Views**: EJS templates with ejs-mate layouts
- **Authentication**: JWT (jsonwebtoken) + bcryptjs
- **Styling**: Custom CSS with modern dark theme
- **Container**: Docker & Docker Compose

## 📁 Project Structure

```
TechLand/
├── app.js                 # Application entry point
├── config.js              # Configuration settings
├── db.sql                 # Database schema
├── docker-compose.yml     # Docker Compose configuration
├── Dockerfile             # Docker image definition
├── package.json           # Project dependencies
├── .env                   # Environment variables
├── public/
│   ├── css/
│   │   └── styles.css     # Main stylesheet
│   └── js/
│       └── main.js        # Frontend JavaScript
└── src/
    ├── controllers/       # Route controllers
    ├── database/          # Database connection
    ├── middleware/        # Auth & other middleware
    ├── routes/            # Express routes
    ├── utils/             # Helper utilities
    └── views/             # EJS templates
        ├── layouts/
        ├── pages/
        ├── partials/
        └── errors/
```

## 🐳 Docker Setup (Recommended)

### Prerequisites
- Docker Desktop or Docker Engine
- Docker Compose

### Quick Start

1. **Clone the repository**
```bash
git clone <repository-url>
cd TechLand
```

2. **Create environment file**
```bash
cp .env.example .env
# Edit .env with your settings
```

3. **Start the containers**
```bash
docker-compose up -d
```

4. **Initialize the database**
```bash
# Connect to PostgreSQL and run db.sql
docker exec -i techland-db psql -U techland -d techland_db < db.sql
```

5. **Access the application**
- App: http://localhost:3000
- PgAdmin: http://localhost:5050 (admin@techland.com / admin)

### Docker Commands

```bash
# Build and start
npm run docker:up

# View logs
npm run docker:logs

# Stop containers
npm run docker:down

# Rebuild
npm run docker:build
```

## 💻 Local Development (Without Docker)

### Prerequisites
- Node.js 18+
- PostgreSQL 16+

### Setup

1. **Install dependencies**
```bash
npm install
```

2. **Configure environment**
```bash
# Create .env file with:
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=techland_db
DB_USER=techland
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
```

3. **Setup database**
```bash
# Create database and run schema
psql -U postgres -c "CREATE DATABASE techland_db"
psql -U postgres -d techland_db < db.sql
```

4. **Start development server**
```bash
npm run dev
```

## 📝 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - Logout
- `POST /auth/refresh` - Refresh token

### Products
- `GET /productos` - List products
- `GET /productos/:slug` - Product details
- `GET /api/productos` - API: List products

### Services
- `GET /servicios` - List services
- `GET /servicios/:slug` - Service details
- `POST /servicios/reservar` - Book a service

### Courses
- `GET /cursos` - List courses
- `GET /cursos/:slug` - Course details

### Cart
- `GET /cart` - View cart
- `POST /cart/add` - Add item
- `POST /cart/update` - Update quantity
- `POST /cart/remove` - Remove item
- `GET /cart/checkout` - Checkout page
- `POST /cart/process-payment` - Process payment

### Profile
- `GET /perfil` - User profile
- `GET /perfil/pedidos` - Order history
- `GET /perfil/cursos` - Enrolled courses
- `GET /perfil/servicios` - Service reservations

## 🎨 Design System

The application uses a modern dark theme with the following color palette:

- **Background**: #0a0a0a (primary), #141414 (secondary)
- **Accent**: #10b981 (emerald green)
- **Text**: #ffffff (primary), #a1a1aa (secondary)

## 🔐 Security

- JWT tokens stored in HTTP-only cookies
- Bcrypt password hashing (12 rounds)
- CORS protection
- Input validation
- SQL injection prevention with parameterized queries

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

## 👥 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

Built with ❤️ by TechLand Team