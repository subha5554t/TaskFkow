# TaskFlow

TaskFlow is a task management application built with Express, Prisma, PostgreSQL, React, and Vite.

## Setup Instructions

### 1. Database Setup
Make sure you have PostgreSQL installed and running. Create a database for the project.

### 2. Backend Setup
Go to the backend folder and install the packages:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder and add these variables:
```env
PORT=3000
DATABASE_URL="postgresql://<user>:<password>@localhost:5432/<database_name>"
JWT_SECRET="your-super-secret-jwt-key-minimum-32-chars"
CLIENT_URL="http://localhost:5173"
```

Run the database migrations and start the server:
```bash
npx prisma migrate dev
npm run dev
```

### 3. Frontend Setup
Go to the frontend folder and install the packages:
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` folder:
```env
VITE_API_URL="http://localhost:3000/api"
```

Start the frontend server:
```bash
npm run dev
```

## Design Decisions

* **Prisma ORM:** We used Prisma because it generates a safe TypeScript client and makes database migrations easy.
* **Express & Zod:** Express handles the routing, and Zod checks that the data coming into the API is valid before it reaches the database.
* **JWT Authentication:** We used JWT tokens so the backend doesn't have to store user sessions. Passwords are encrypted with bcrypt.
* **React + Vite:** We used Vite instead of Create React App because it builds much faster and updates the browser instantly when code changes.

## Unit Testing

We wrote unit tests using Jest to check the main business logic (auth, projects, and tasks). We used `jest-mock-extended` to mock the Prisma database so the tests run fast and don't need a real database connection.

To run the tests:
```bash
cd backend
npm test
```

## API Documentation

You can find the API documentation in the `API_DOCUMENTATION.md` file.
