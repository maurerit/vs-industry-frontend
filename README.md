# VS Industry

A web application for managing EVE Online industry operations, built with Cursor.

## Overview

This frontend application is part of a full-stack solution for managing industry operations in EVE Online. It provides a user-friendly interface for tracking warehouse inventory, market orders, and corporate finances.

## Backend Implementation

This frontend application works in conjunction with a Spring Boot backend implementation. For more details about the backend, please visit:

- Backend Repository: [https://github.com/maurerit/vs-industry-backend](https://github.com/maurerit/vs-industry-backend)
- Backend Documentation: [Backend README.md](https://github.com/maurerit/vs-industry-backend/blob/main/README.md)

## Features

- Warehouse inventory management
- Market order tracking
- Corporate wallet balance monitoring
- Real-time data updates
- User authentication via EVE Online SSO

## Development

This project was built using Cursor, a modern IDE for web development. The frontend is built with React and Material-UI, providing a responsive and intuitive user interface.

## Getting Started

1. Clone the repository
2. Change directory to the frontend `cd frontend`
3. Install dependencies: `npm install`
4. Start the development server: `npm run dev`
5. Change directory to the sso backend `cd ../backend`
6. `npm install`
7. `npm run dev`
8. Go start the java backend
9. Access the application at `http://localhost:5173`

## Dependencies

- React
- Material-UI
- React Router
- TypeScript 