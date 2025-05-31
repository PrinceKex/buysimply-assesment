# Buysimply API

Buysimply is a modern e-commerce API platform built with NestJS, PostgreSQL, and Redis. It provides a robust backend infrastructure for managing users, tasks, authentication, and caching.

## Features

- User management with authentication and authorization
- Task management system
- Redis integration for caching and rate limiting
- JWT-based authentication
- Role-based access control
- RESTful API endpoints
- Swagger documentation
- TypeScript support
- Docker containerization

## Prerequisites

- Node.js 18+
- Docker and Docker Compose (recommended)
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment:
   - Create a `.env` file based on `.env.development`
   - Configure database and Redis settings
   - Set up JWT secrets and other configurations

## Running the Application

### Using Docker (Recommended)

```bash
# Start all services (PostgreSQL, Redis, and API)
docker compose up -d

# Stop all services
docker compose down
```

### Without Docker

```bash
# Start PostgreSQL and Redis manually
# Then start the application
npm run start:dev
```

## API Documentation

The API is documented using Swagger/OpenAPI. Access the documentation at:
- Development: http://localhost:3000/api
- Production: http://<your-domain>/api

## Testing

The project includes comprehensive unit tests and integration tests.

```bash
# Run all tests
npm run test

# Run tests with coverage report
npm run test:cov

# Run tests in watch mode (for development)
npm run test:watch

# Run specific test file
npm run test -- test/<file>.spec.ts
```

## Project Structure

```
src/
├── auth/           # Authentication and authorization
├── redis/          # Redis integration
├── tasks/          # Task management
├── users/          # User management
├── common/         # Shared utilities and interfaces
└── app.module.ts   # Root module
```
