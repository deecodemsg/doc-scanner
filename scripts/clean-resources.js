#!/usr/bin/env node

/**
 * Clean DWT Resources Directory
 * 
 * Cross-platform script to remove the public/Resources directory
 * Works on Windows, macOS, and Linux
 * 
 * Usage:
 *   node scripts/clean-resources.js
 */

const fs = require('fs');
const path = require('path');

const resourcesPath = path.join(__dirname, '../public/Resources');
const verbose = process.argv.includes('--verbose');

/**
 * Recursively remove directory
 */
function removeDirectoryRecursive(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach((file) => {
      const curPath = path.join(dirPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        // Recursively delete subdirectory
        removeDirectoryRecursive(curPath);
      } else {
        // Delete file
        fs.unlinkSync(curPath);
      }
    });
    // Delete the now-empty directory
    fs.rmdirSync(dirPath);
  }
}

/**
 * Main execution
 */
function main() {
  try {
    if (fs.existsSync(resourcesPath)) {
      if (verbose) {
        console.log(`🗑️  Removing: ${resourcesPath}`);
      }
      
      removeDirectoryRecursive(resourcesPath);
      
      if (verbose) {
        console.log(`✅ Successfully removed ${resourcesPath}`);
      }
    } else {
      if (verbose) {
        console.log(`ℹ️  Directory doesn't exist: ${resourcesPath}`);
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error removing resources: ${error.message}`);
    process.exit(1);
  }
}

main();
