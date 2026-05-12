# Team Task Manager

A Full-Stack Team Task Management Web Application built to meet the functional assignment requirements. 
This project uses **Next.js**, **Prisma**, **SQLite**, and **JSON Web Tokens (JWT)** for authentication.

## Prerequisites

Make sure you have [Node.js](https://nodejs.org/) (v18 or higher) installed on your system.

## Setup Instructions

Follow these exact steps to set up the application from scratch and run it locally.

### 1. Install Dependencies
Run the following command to install all necessary packages:
```bash
npm install
```

### 2. Initialize the Database
This application is configured to use an easy-to-run local SQLite database (`dev.db`). You don't need to install any external database server. Just run the following command to synchronize the database schema:
```bash
npx prisma db push
```
*Note: This command reads the `prisma/schema.prisma` file, creates the `dev.db` database file, and generates the Prisma Client.*

### 3. Start the Development Server
Once the database is initialized, you can start the application:
```bash
npm run dev
```

### 4. Open the App
Open [http://localhost:3000](http://localhost:3000) in your web browser. You will be redirected to the login/signup page where you can create a new account to test out the application!

## Features Implemented
- **User Authentication:** Signup, secure login with bcrypt password hashing, and JWT session handling via HTTP-only cookies.
- **Project Management:** Project creation (creates an Admin role) and adding/removing team members via email.
- **Task Management:** Create tasks (Title, Description, Due Date, Priority), assign users, and update workflow statuses.
- **Dashboard:** Generates metrics calculating total tasks, tasks by status, tasks per user, and an overdue tasks counter.
- **Role-Based Access:** 
  - **Admin:** Has full control over tasks and can add/remove members.
  - **Member:** Can view projects and is only allowed to update the status of tasks explicitly assigned to them.
