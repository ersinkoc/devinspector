#!/usr/bin/env node

import { readFileSync, statSync } from 'fs';
import { gzipSync } from 'zlib';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function prettyBytes(bytes) {
  const units = ['B', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + units[i];
}

const MAX_SIZE_GZIPPED = 50 * 1024; // 50KB

console.log('\n📊 Bundle Size Report\n');

const files = [
  'dist/devinspector.esm.js',
  'dist/devinspector.cjs.js',
  'dist/devinspector.umd.js',
  'dist/devinspector.umd.min.js'
];

let hasError = false;

files.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  
  try {
    const content = readFileSync(filePath);
    const stat = statSync(filePath);
    const gzipped = gzipSync(content);
    
    console.log(`📄 ${path.basename(file)}`);
    console.log(`   Raw: ${prettyBytes(stat.size)}`);
    console.log(`   Gzipped: ${prettyBytes(gzipped.length)}`);
    
    if (file.includes('.min.js') && gzipped.length > MAX_SIZE_GZIPPED) {
      console.log(`   ⚠️  WARNING: Exceeds ${prettyBytes(MAX_SIZE_GZIPPED)} limit!`);
      hasError = true;
    }
    
    console.log('');
  } catch (error) {
    console.error(`❌ Error reading ${file}:`, error.message);
  }
});

if (hasError) {
  console.log('⚠️  Bundle size exceeds recommended limits!');
  console.log('Consider using dynamic imports for optional features.\n');
}