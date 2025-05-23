import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { spawn, ChildProcess } from 'child_process';
import treeKill from 'tree-kill';
import * as fs from 'fs';

// Ensure only one instance of the app can run at a time
// This must be at the very beginning before any other initialization
console.log('Checking for existing app instance...');
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  // If we couldn't get the lock, another instance is already running
  console.log('Another instance is already running. Quitting...');
  app.exit(0); // Force immediate exit
} else {
  console.log('This is the first instance of the app');
}

// Global reference to prevent garbage collection
let mainWindow: BrowserWindow | null = null;
let backendProcess: ChildProcess | null = null;
let expressApp: express.Express;
let frontendServer: any;

// Backend API port
const BACKEND_PORT = 3000;
// Frontend proxy port
const FRONTEND_PORT = 8081;

async function startBackend() {
  const isProduction = app.isPackaged;

  let backendPath: string;
  let nodePath: string;

  if (isProduction) {
    // In production, use the bundled backend
    backendPath = path.join(process.resourcesPath, 'backend');
    nodePath = process.execPath; // Use Electron's Node.js
  } else {
    // In development, use the local backend
    backendPath = path.resolve(__dirname, '../../backend');
    nodePath = 'node';
  }

  console.log(`Starting backend from: ${backendPath}`);

  // Make sure the backend is built
  if (isProduction) {
    // In production, the backend should already be built and bundled
    if (!fs.existsSync(path.join(backendPath, 'index.js'))) {
      console.error('Backend build not found!');
      return false;
    }
  } else {
    // In development, build the backend if needed
    try {
      const { execSync } = require('child_process');
      execSync('npm run build', { cwd: path.resolve(__dirname, '../../backend') });
    } catch (error) {
      console.error('Failed to build backend:', error);
      return false;
    }
  }

  try {
    // Start the backend process
    const nodeExecutable = isProduction ? nodePath : 'node';
    const scriptPath = isProduction 
      ? path.join(backendPath, 'index.js')
      : path.join(backendPath, 'dist', 'index.js');

    backendProcess = spawn(nodeExecutable, [scriptPath], {
      cwd: backendPath,
      env: { ...process.env, PORT: BACKEND_PORT.toString() },
      stdio: 'pipe' // Capture output
    });

    // Handle output
    backendProcess.stdout?.on('data', (data) => {
      console.log(`Backend stdout: ${data}`);
    });

    backendProcess.stderr?.on('data', (data) => {
      console.error(`Backend stderr: ${data}`);
    });

    backendProcess.on('error', (error) => {
      console.error(`Failed to start backend: ${error.message}`);
      return false;
    });

    backendProcess.on('close', (code) => {
      console.log(`Backend process exited with code ${code}`);
      backendProcess = null;
    });

    // Wait a bit for the backend to start
    await new Promise(resolve => setTimeout(resolve, 2000));
    return true;
  } catch (error) {
    console.error('Error starting backend:', error);
    return false;
  }
}

function startFrontendServer() {
  expressApp = express();

  // Set up proxy to backend
  expressApp.use('/js-api', createProxyMiddleware({
    target: `http://localhost:${BACKEND_PORT}`,
    changeOrigin: true,
    pathRewrite: { '^/js-api': '' }
  }));

  // Serve static frontend files
  const frontendPath = app.isPackaged
    ? path.join(process.resourcesPath, 'frontend')
    : path.resolve(__dirname, '../../frontend/dist');

  console.log(`Serving frontend from: ${frontendPath}`);
  expressApp.use(express.static(frontendPath));

  // Always return index.html for any non-asset route (for SPA routing)
  expressApp.get('*', (req, res, next) => {
    if (req.path.includes('.')) {
      next(); // Let express handle asset files
    } else {
      res.sendFile(path.join(frontendPath, 'index.html'));
    }
  });

  // Start the server
  frontendServer = expressApp.listen(FRONTEND_PORT, () => {
    console.log(`Frontend server running on port ${FRONTEND_PORT}`);
  });
}

async function createWindow() {
  console.log('Creating application window...');

  try {
    // Only start the backend if it's not already running
    if (!backendProcess) {
      console.log('Starting backend server...');
      const backendStarted = await startBackend();
      if (!backendStarted) {
        console.error('Failed to start backend. Exiting...');
        app.exit(1);
        return;
      }
      console.log('Backend server started successfully');
    } else {
      console.log('Backend server already running');
    }

    // Only start the frontend server if it's not already running
    if (!frontendServer) {
      console.log('Starting frontend server...');
      startFrontendServer();
      console.log('Frontend server started successfully');
    } else {
      console.log('Frontend server already running');
    }

    // Create the browser window
    console.log('Creating browser window...');
    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false
      }
    });

    // Load the app
    console.log(`Loading app from http://localhost:${FRONTEND_PORT}`);
    await mainWindow.loadURL(`http://localhost:${FRONTEND_PORT}`);
    console.log('App loaded successfully');

    // Open DevTools in development
    if (!app.isPackaged) {
      mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', () => {
      console.log('Main window closed');
      mainWindow = null;
    });

    console.log('Window creation complete');
    return true;
  } catch (error) {
    console.error('Error creating window:', error);
    // Force exit the app on critical errors
    app.exit(1);
    return false;
  }
}

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Flag to track if we're in the process of creating a window
let isCreatingWindow = false;

// Set up the single instance handler
app.on('second-instance', (event, commandLine, workingDirectory) => {
  console.log('Second instance detected, focusing existing window');

  // Someone tried to run a second instance, focus our window instead
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  } else {
    // If for some reason we don't have a window but got a second-instance event,
    // create one (this shouldn't normally happen)
    console.log('No window found for second instance, creating one');
    if (!isCreatingWindow) {
      isCreatingWindow = true;
      createWindow().finally(() => {
        isCreatingWindow = false;
      });
    }
  }
});

app.on('activate', async () => {
  console.log('App activated event triggered');
  // Only create a window if one doesn't exist and we're not already in the process of creating one
  if (mainWindow === null && !isCreatingWindow) {
    console.log('No main window exists, creating one');
    isCreatingWindow = true;
    try {
      await createWindow();
    } catch (error) {
      console.error('Error in activate event:', error);
    } finally {
      isCreatingWindow = false;
    }
  } else {
    console.log('Main window already exists or is being created');
    if (mainWindow) {
      console.log('Focusing existing window');
      mainWindow.focus();
    }
  }
});

// Handle app ready
app.whenReady().then(async () => {
  console.log('App ready event triggered');
  // Only create a window if one doesn't exist and we're not already in the process of creating one
  if (mainWindow === null && !isCreatingWindow) {
    console.log('Creating initial window');
    isCreatingWindow = true;
    try {
      const success = await createWindow();
      if (!success) {
        console.error('Failed to create window during app ready');
        app.exit(1);
      }
    } catch (error) {
      console.error('Error in whenReady event:', error);
      app.exit(1);
    } finally {
      isCreatingWindow = false;
    }
  } else {
    console.log('Window already exists or is being created');
  }
}).catch(error => {
  console.error('Error in app.whenReady():', error);
  app.exit(1);
});

// Clean up resources before quitting
app.on('will-quit', (event) => {
  console.log('App will quit event triggered, cleaning up resources...');

  // Perform cleanup asynchronously
  const cleanup = async () => {
    try {
      // Close the frontend server
      if (frontendServer) {
        console.log('Closing frontend server...');
        await new Promise<void>((resolve) => {
          frontendServer.close(() => {
            console.log('Frontend server closed');
            resolve();
          });
        });
      }

      // Kill the backend process
      if (backendProcess && backendProcess.pid) {
        const pid = backendProcess.pid; // Store pid in a local variable outside the Promise
        console.log(`Killing backend process (PID: ${pid})...`);
        await new Promise<void>((resolve, reject) => {
          // Use tree-kill to ensure all child processes are terminated
          treeKill(pid, (err) => {
            if (err) {
              console.error('Error killing backend process:', err);
              reject(err);
            } else {
              console.log('Backend process terminated');
              resolve();
            }
          });
        }).catch(error => {
          console.error('Failed to kill backend process:', error);
        });
      }

      console.log('Cleanup complete');
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  };

  // Prevent the app from quitting until cleanup is done
  event.preventDefault();

  // Perform cleanup and then quit
  cleanup().then(() => {
    console.log('Exiting application...');
    setTimeout(() => {
      app.exit(0);
    }, 500); // Give a small delay to ensure all logs are written
  });
});

// Force cleanup on exit signals
['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach(signal => {
  process.on(signal, () => {
    console.log(`Received ${signal}, exiting...`);
    app.quit();
  });
});
