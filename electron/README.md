# VS Industry Electron Application

This is an Electron wrapper for the VS Industry application that packages both the frontend and backend into a single desktop application.

## Architecture

The Electron app runs three main components:

1. **Frontend**: The React application that serves as the user interface
2. **Backend**: The Node.js Koa server that provides the API functionality
3. **Proxy**: An Express server that forwards API requests from the frontend to the backend

The backend runs as a child process inside the Electron application, making it a "soft dependency" that can be easily updated or replaced without rebuilding the entire application.

## Development

### Prerequisites

- Node.js v18+ and npm

### Setup

Install dependencies for all components:

```bash
# Install Electron app dependencies
cd electron
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### Running in Development Mode

To run the application in development mode:

```bash
# From the electron directory
npm run dev
```

This will:
1. Compile the TypeScript files
2. Start the Electron application
3. Start the backend server as a child process
4. Serve the frontend via an Express server with proxy to the backend

## Building for Production

To build and package the application for production:

```bash
# From the electron directory
npm run build:all
```

This will:
1. Build the frontend
2. Build the backend
3. Build the Electron application
4. Package everything into an installable application

The packaged application will be in the `electron/release` directory.

## How It Works

- The main Electron process starts the backend as a child process
- An Express server serves the frontend and proxies API requests to the backend
- The Electron BrowserWindow loads the frontend from the Express server
- When the application closes, it properly terminates the backend process

## Troubleshooting

If you encounter issues:

1. Check the Electron logs (accessible via DevTools in development mode)
2. Verify the backend is running properly (check the console output)
3. Make sure the proxy is correctly forwarding requests to the backend

## License

ISC