#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔨 Building DevInspector...');

// Ensure dist directory exists
const distPath = path.join(__dirname, '..', 'dist');
if (!existsSync(distPath)) {
  mkdirSync(distPath, { recursive: true });
}

try {
  // Clean dist directory
  console.log('📦 Cleaning dist directory...');
  execSync('rm -rf dist/*', { stdio: 'inherit' });
  
  // Run TypeScript compiler for type declarations
  console.log('📝 Generating TypeScript declarations...');
  execSync('tsc --emitDeclarationOnly', { stdio: 'inherit' });
  
  // Run Rollup build
  console.log('🚀 Building bundles...');
  execSync('rollup -c', { stdio: 'inherit' });
  
  // Check bundle sizes
  console.log('📊 Checking bundle sizes...');
  execSync('node scripts/size-check.js', { stdio: 'inherit' });
  
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}