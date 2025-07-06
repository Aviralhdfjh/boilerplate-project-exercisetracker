# Exercise Tracker

This is a full-stack JavaScript exercise tracker application built with Node.js, Express, and MongoDB.

## Features

- Create new users
- Add exercises to users
- View user's exercise log with optional filtering
- Filter exercises by date range and limit results

## API Endpoints

### POST /api/users
Create a new user.
- **Body**: `{ username: "string" }`
- **Response**: `{ username: "string", _id: "string" }`

### GET /api/users
Get all users.
- **Response**: Array of `{ username: "string", _id: "string" }`

### POST /api/users/:_id/exercises
Add an exercise to a user.
- **Body**: `{ description: "string", duration: number, date: "yyyy-mm-dd" (optional) }`
- **Response**: `{ username: "string", description: "string", duration: number, date: "Mon Jan 01 1990", _id: "string" }`

### GET /api/users/:_id/logs?[from][&to][&limit]
Get user's exercise log with optional filtering.
- **Query Parameters**:
  - `from`: Start date (yyyy-mm-dd)
  - `to`: End date (yyyy-mm-dd)
  - `limit`: Maximum number of exercises to return
- **Response**: `{ username: "string", count: number, _id: "string", log: [{ description: "string", duration: number, date: "Mon Jan 01 1990" }] }`

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file with your MongoDB connection string:
   ```
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/exercise-tracker
   ```

3. Start the application:
   ```bash
   npm start
   ```

4. Open your browser to `http://localhost:3000`

## Requirements

- Node.js
- MongoDB (local or cloud instance)

## Usage

1. Create a new user by entering a username
2. Add exercises to users by providing their ID, description, duration, and optional date
3. View exercise logs by visiting `/api/users/:_id/logs`

The application provides a web interface for testing all functionality.
