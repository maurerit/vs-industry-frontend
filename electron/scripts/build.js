#!/usr/bin/env node

/**
 * Build script for the VS Industry Electron app
 * This script builds the frontend, backend, and Electron app, then packages them together
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Paths
const rootDir = path.resolve(__dirname, '..');
const frontendDir = path.join(rootDir, 'frontend');
const backendDir = path.join(rootDir, 'backend');
const electronDir = path.join(rootDir, 'electron');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

/**
 * Run a command in a specific directory
 * @param {string} command The command to run
 * @param {string} cwd The working directory
 * @param {boolean} silent Whether to hide the output
 */
function runCommand(command, cwd, silent = false) {
  try {
    console.log(`${colors.bright}${colors.cyan}Running:${colors.reset} ${command} ${colors.yellow}in ${cwd}${colors.reset}`);
    execSync(command, { 
      cwd, 
      stdio: silent ? 'ignore' : 'inherit' 
    });
    return true;
  } catch (error) {
    console.error(`${colors.bright}${colors.red}Error running:${colors.reset} ${command}`);
    console.error(error.message);
    return false;
  }
}

/**
 * Build the frontend application
 */
function buildFrontend() {
  console.log(`\n${colors.bright}${colors.green}Building Frontend...${colors.reset}\n`);
  
  // Install dependencies if needed
  if (!fs.existsSync(path.join(frontendDir, 'node_modules'))) {
    console.log(`${colors.yellow}Installing frontend dependencies...${colors.reset}`);
    if (!runCommand('npm install', frontendDir)) {
      return false;
    }
  }
  
  // Build the frontend
  return runCommand('npm run build', frontendDir);
}

/**
 * Build the backend application
 */
function buildBackend() {
  console.log(`\n${colors.bright}${colors.green}Building Backend...${colors.reset}\n`);
  
  // Install dependencies if needed
  if (!fs.existsSync(path.join(backendDir, 'node_modules'))) {
    console.log(`${colors.yellow}Installing backend dependencies...${colors.reset}`);
    if (!runCommand('npm install', backendDir)) {
      return false;
    }
  }
  
  // Build the backend
  return runCommand('npm run build', backendDir);
}

/**
 * Build and package the Electron application
 */
function buildElectron() {
  console.log(`\n${colors.bright}${colors.green}Building Electron App...${colors.reset}\n`);
  
  // Install dependencies if needed
  if (!fs.existsSync(path.join(electronDir, 'node_modules'))) {
    console.log(`${colors.yellow}Installing Electron dependencies...${colors.reset}`);
    if (!runCommand('npm install', electronDir)) {
      return false;
    }
  }
  
  // Build the Electron app
  if (!runCommand('npm run build', electronDir)) {
    return false;
  }
  
  // Package the Electron app
  console.log(`\n${colors.bright}${colors.green}Packaging Electron App...${colors.reset}\n`);
  return runCommand('npm run package', electronDir);
}

/**
 * Main build process
 */
async function build() {
  console.log(`${colors.bright}${colors.green}Starting build process for VS Industry Electron App...${colors.reset}\n`);
  
  // Build frontend
  if (!buildFrontend()) {
    console.error(`${colors.bright}${colors.red}Frontend build failed. Aborting.${colors.reset}`);
    process.exit(1);
  }
  
  // Build backend
  if (!buildBackend()) {
    console.error(`${colors.bright}${colors.red}Backend build failed. Aborting.${colors.reset}`);
    process.exit(1);
  }
  
  // Build and package Electron
  if (!buildElectron()) {
    console.error(`${colors.bright}${colors.red}Electron packaging failed.${colors.reset}`);
    process.exit(1);
  }
  
  console.log(`\n${colors.bright}${colors.green}Build completed successfully!${colors.reset}`);
  console.log(`${colors.yellow}The packaged application can be found in:${colors.reset} ${path.join(electronDir, 'release')}\n`);
}

// Run the build
build().catch(error => {
  console.error(`${colors.bright}${colors.red}Build failed:${colors.reset}`, error);
  process.exit(1);
});