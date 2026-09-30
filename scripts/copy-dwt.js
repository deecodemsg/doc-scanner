#!/usr/bin/env node

/**
 * Copy DWT (Dynamic Web TWAIN) Resources from node_modules to public folder
 * 
 * This script copies the DWT runtime files from node_modules/dwt/dist
 * to public/Resources for use during development and build.
 * 
 * Usage:
 *   node scripts/copy-dwt.js          # Silent mode
 *   node scripts/copy-dwt.js --verbose # With detailed logging
 *   node scripts/copy-dwt.js --force   # Force overwrite (same as --verbose)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const verbose = process.argv.includes('--verbose') || process.argv.includes('--force');

const srcPath = path.join(__dirname, '../node_modules/dwt/dist');
const destPath = path.join(__dirname, '../public/Resources');

/**
 * Log utility
 */
function log(message, isError = false) {
  if (verbose || isError) {
    const prefix = isError ? '❌' : '✅';
    console.log(`${prefix} ${message}`);
  }
}

/**
 * Check if source exists
 */
function checkSourceExists() {
  if (!fs.existsSync(srcPath)) {
    console.error(`❌ ERROR: DWT source not found at ${srcPath}`);
    console.error('   Make sure to run: npm install');
    process.exit(1);
  }
  log(`Found DWT source at ${srcPath}`);
}

/**
 * Create destination directory if it doesn't exist
 */
function ensureDestDir() {
  if (!fs.existsSync(destPath)) {
    fs.mkdirSync(destPath, { recursive: true });
    log(`Created destination directory: ${destPath}`);
  } else {
    log(`Destination directory exists: ${destPath}`);
  }
}

/**
 * Copy files using native command (cross-platform)
 */
function copyFiles() {
  try {
    log(`Copying DWT files from ${srcPath} to ${destPath}`);
    
    // Use node's built-in copy functionality
    const files = fs.readdirSync(srcPath);
    let copiedCount = 0;
    
    files.forEach((file) => {
      const srcFile = path.join(srcPath, file);
      const destFile = path.join(destPath, file);
      
      const stat = fs.statSync(srcFile);
      
      if (stat.isDirectory()) {
        // Recursively copy directory
        copyDirRecursive(srcFile, destFile);
      } else {
        // Copy file
        fs.copyFileSync(srcFile, destFile);
      }
      
      copiedCount++;
      log(`  📄 ${file}`);
    });
    
    log(`Successfully copied ${copiedCount} items`);
    return true;
  } catch (error) {
    console.error(`❌ Copy failed: ${error.message}`);
    return false;
  }
}

/**
 * Recursively copy directory
 */
function copyDirRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const files = fs.readdirSync(src);
  files.forEach((file) => {
    const srcFile = path.join(src, file);
    const destFile = path.join(dest, file);
    const stat = fs.statSync(srcFile);
    
    if (stat.isDirectory()) {
      copyDirRecursive(srcFile, destFile);
    } else {
      fs.copyFileSync(srcFile, destFile);
    }
  });
}

/**
 * Verify copy was successful
 */
function verifyCopy() {
  const requiredFiles = [
    'dynamsoft.webtwain.min.js',
    'dynamsoft.webtwain.min.mjs',
  ];
  
  const missingFiles = requiredFiles.filter(
    (file) => !fs.existsSync(path.join(destPath, file))
  );
  
  if (missingFiles.length > 0) {
    console.error(`❌ Verification failed - Missing files:`);
    missingFiles.forEach((f) => console.error(`   - ${f}`));
    process.exit(1);
  }
  
  log(`✅ Verification passed - All required files present`);
}

/**
 * Main execution
 */
function main() {
  if (verbose) {
    console.log('📦 DWT Resources Copy Utility');
    console.log(`   Source: ${srcPath}`);
    console.log(`   Destination: ${destPath}`);
    console.log('');
  }
  
  try {
    checkSourceExists();
    ensureDestDir();
    
    const success = copyFiles();
    if (!success) {
      process.exit(1);
    }
    
    verifyCopy();
    
    if (verbose) {
      console.log('');
      console.log('✅ DWT Resources copied successfully!');
      console.log('   Ready for webpack build.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error(`❌ Fatal error: ${error.message}`);
    process.exit(1);
  }
}

// Run
main();
