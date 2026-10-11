# My-Shelf

**Your personal space for discovering, organizing, and tracking books.**

My-Shelf is a full-stack web application that helps readers discover books and organize their personal reading lists. Users can create an account, explore books, search for new titles, and manage their own bookshelves.

The project was built from scratch to explore full-stack development, REST APIs, authentication, relational databases, containerization, and cloud deployment.

🌐 **Live Demo:** [My-Shelf](https://my-shelf-wine.vercel.app)

📂 **Repository:** [GitHub](https://github.com/jinx14232/My-Shelf)

---

## Features

- **User Authentication** — Register and log in securely using password hashing and JSON Web Tokens (JWT).
- **Book Discovery** — Explore a collection of books stored in the database.
- **Book Search** — Search for books using data from the Open Library API.
- **Personal Bookshelf** — Organize books according to your reading status.
- **Reading Status Management** — Keep track of books you are currently reading, want to read, or have finished.
- **Relational Database** — Store book information centrally while maintaining separate reading lists for individual users.
- **Persistent Storage** — Store user accounts, book records, and bookshelf information in PostgreSQL.
- **Cloud Deployment** — Deploy the application using Vercel and Neon PostgreSQL.
- **Docker Support** — Run the application and database in containers for a consistent development environment.

## Tech Stack

| Technology | Purpose |
|---|---|
| HTML, CSS, JavaScript | Frontend and user interface |
| Node.js | JavaScript runtime |
| Express.js | Backend server and REST API |
| PostgreSQL | Relational database |
| Prisma ORM | Database queries and schema management |
| JWT | Authentication and protected routes |
| bcryptjs | Password hashing |
| Open Library API | External book data |
| Docker & Docker Compose | Containerization and local development |
| Vercel | Application deployment |
| Neon | Hosted PostgreSQL database |
| Git & GitHub | Version control |

## Architecture

My-Shelf follows a client-server architecture.

1. The **frontend** provides the interface for authentication, searching, exploring books, and managing a bookshelf.
2. The **Express backend** handles API requests, authentication, authorization, and application logic.
3. **Prisma ORM** communicates with PostgreSQL and manages database operations.
4. **PostgreSQL** stores users, shared book records, and user-specific bookshelf entries.
5. The **Open Library API** provides external book information that can be added to the application's database.
6. **Vercel and Neon** provide the production hosting environment.

### Database Design

The application separates shared book information from individual users' reading lists.

- `users` — Stores user account information.
- `books` — Stores book information shared across the application.
- `user_books` — Associates users with books and tracks their individual reading statuses.

This design allows multiple users to reference the same book without maintaining duplicate book records for each user's bookshelf.

## Authentication & Authorization

The application uses JSON Web Tokens (JWT) to authenticate users.

- Passwords are hashed using `bcryptjs` before storage.
- Successful authentication provides a JWT.
- Protected routes use authentication middleware to validate incoming tokens.
- User-specific bookshelf operations are associated with the authenticated user's ID.

## Book Discovery

My-Shelf integrates with the [Open Library API](https://openlibrary.org/developers/api) to retrieve book information.

Retrieved book data can be stored in the shared books database, allowing the application to reuse book records across users rather than creating a separate copy for every search.

## Getting Started

Follow these steps to run My-Shelf locally.

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (Node.js 22 recommended)
- npm
- [PostgreSQL](https://www.postgresql.org/) or Docker with Docker Compose
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/jinx14232/My-Shelf.git
cd My-Shelf
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root.

```env
PORT=5000
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/your_shelf"
JWT_SECRET="replace_with_a_secure_random_secret"
```

Replace the database credentials with your local PostgreSQL configuration. Use a strong, private JWT secret.


### 4. Set Up the Database

Ensure PostgreSQL is running and the `your_shelf` database exists.

Apply the existing Prisma migrations:

```bash
npx prisma migrate deploy
```

Generate the Prisma Client if needed:

```bash
npx prisma generate
```

### 5. Start the Application

Run the server using your configured development script, or execute the server entry point directly:

```bash
node src/server.js
```

If the server starts successfully, it should be available at:

```text
http://localhost:5000
```

The exact startup command depends on the scripts configured in `package.json`.

## Running with Docker

My-Shelf also supports a containerized environment using Docker Compose.

If Docker and Docker Compose are installed and your Compose configuration is present in the repository, start the services with:

```bash
docker-compose up --build
```

To stop the services:

```bash
docker-compose down

```
## Deployment

The production application uses:

- **Vercel** for application hosting.
- **Neon** for managed PostgreSQL.
- **Environment variables** for production configuration.
- **Prisma migrations** to manage database schema changes.

Production database credentials and JWT secrets should be configured through the hosting provider's environment variable settings, not committed to source control.

## Project Structure

The main application structure includes:

```text
My-Shelf/
├── src/
│   ├── server.js
│   ├── prismaClient.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── appRoutes.js
│   │   └── bookRoutes.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   └── ...
├── public/
│   ├── index.html
│   ├── dashboard.html
│   └── Assets/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── api/
│   └── index.js
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── .gitignore
├── package.json
└── README.md

```
## What I Learned

Building My-Shelf helped me put several backend and full-stack development concepts into practice:

- Designing and building a REST API with Express.js.
- Implementing authentication with JWT and password hashing.
- Modeling relational data and user-specific relationships.
- Using Prisma ORM and database migrations.
- Integrating an external API into a full-stack application.
- Managing environment variables and application configuration.
- Containerizing an application and database with Docker.
- Deploying a Node.js application and connecting it to a hosted PostgreSQL database.
- Using Git and GitHub throughout the development process.

## Future Improvements

Potential improvements include:

- Advanced book filtering and sorting.
- Pagination and more efficient search results.
- Reading progress and personal reading statistics.
- Book ratings, reviews, and personalized recommendations.
- Automated tests for API endpoints and authentication.
- Improved error handling, validation, and security.

## Author

**Hassan Alam**

Computer Science student exploring full-stack development, backend engineering, and software architecture.

- GitHub: [@jinx14232](https://github.com/jinx14232)

---

*Built with curiosity, JavaScript, and a love for books. 📚*
