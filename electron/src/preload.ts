import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron',
  {
    // Add any IPC methods needed for communication between renderer and main processes
    // For example:
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),
    // Add more methods as needed for your application
  }
);