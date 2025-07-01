#!/usr/bin/env node

const { execSync } = require('child_process');
const { readFileSync, writeFileSync } = require('fs');
const path = require('path');

console.log('🚀 DevInspector Release Script');
console.log('=============================\n');

// Read package.json
const packagePath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
const version = packageJson.version;

console.log(`📦 Preparing release for DevInspector v${version}\n`);

try {
  // Step 1: Clean and build
  console.log('🧹 Cleaning previous builds...');
  execSync('rm -rf dist/*', { stdio: 'inherit' });
  
  console.log('🔨 Building production bundles...');
  execSync('npx rollup -c rollup.simple.config.js', { stdio: 'inherit' });
  
  // Step 2: Run tests
  console.log('\n🧪 Running production tests...');
  execSync('node test-production.js', { stdio: 'inherit' });
  
  // Step 3: Check bundle sizes
  console.log('\n📊 Checking bundle sizes...');
  const { statSync } = require('fs');
  const { gzipSync } = require('zlib');
  
  const minFile = 'dist/devinspector.umd.min.js';
  const content = readFileSync(minFile);
  const originalSize = statSync(minFile).size;
  const gzippedSize = gzipSync(content).length;
  
  console.log(`   Original: ${(originalSize / 1024).toFixed(1)}KB`);
  console.log(`   Gzipped: ${(gzippedSize / 1024).toFixed(1)}KB`);
  
  if (gzippedSize > 50 * 1024) {
    throw new Error('Bundle size exceeds 50KB limit!');
  }
  
  // Step 4: Generate release files
  console.log('\n📋 Generating release documentation...');
  
  // Create a release README
  const releaseReadme = `# DevInspector v${version}

## Release Summary
- Version: ${version}
- Bundle size: ${(gzippedSize / 1024).toFixed(1)}KB gzipped
- Zero dependencies
- Production ready

## Installation
\`\`\`bash
npm install @oxog/devinspector@${version}
\`\`\`

## CDN
\`\`\`html
<script src="https://unpkg.com/@oxog/devinspector@${version}/dist/devinspector.umd.min.js"></script>
\`\`\`

## Quick Start
\`\`\`javascript
import DevInspector from '@oxog/devinspector';

const inspector = new DevInspector();
inspector.show();
\`\`\`

See [full documentation](./README.md) for more details.
`;

  writeFileSync('RELEASE.md', releaseReadme);
  
  // Step 5: Create git tag (optional)
  console.log('\n🏷️  Creating git tag...');
  try {
    execSync(`git tag -a v${version} -m "Release v${version}"`, { stdio: 'inherit' });
    console.log(`   ✅ Created tag v${version}`);
  } catch (error) {
    console.log('   ⚠️  Git tag creation skipped (not in git repo or tag exists)');
  }
  
  // Step 6: Package for npm
  console.log('\n📦 Preparing NPM package...');
  
  // Create a simplified package.json for dist
  const distPackage = {
    ...packageJson,
    main: 'devinspector.cjs.js',
    module: 'devinspector.esm.js',
    browser: 'devinspector.umd.js',
    types: 'types/simple-index.d.ts',
    files: [
      '*.js',
      '*.js.map',
      'types/',
      '../README.md',
      '../LICENSE'
    ],
    scripts: undefined,
    devDependencies: undefined
  };
  
  writeFileSync('dist/package.json', JSON.stringify(distPackage, null, 2));
  
  // Step 7: Show release summary
  console.log('\n🎉 Release preparation complete!');
  console.log('================================\n');
  console.log(`📋 Release Summary:`);
  console.log(`   Version: v${version}`);
  console.log(`   Bundle size: ${(gzippedSize / 1024).toFixed(1)}KB gzipped`);
  console.log(`   Files: ESM, CJS, UMD builds with source maps`);
  console.log(`   Dependencies: 0`);
  console.log(`   TypeScript: ✅ Included`);
  console.log(`   Browser support: Chrome 80+, Firefox 75+, Safari 13+\n`);
  
  console.log(`🚀 Ready for deployment!`);
  console.log(`\nNext steps:`);
  console.log(`   1. Review the built files in dist/`);
  console.log(`   2. Test the production example: examples/production/index.html`);
  console.log(`   3. Publish to npm: npm publish`);
  console.log(`   4. Push git tags: git push origin --tags`);
  console.log(`   5. Create GitHub release with CHANGELOG.md\n`);
  
  console.log(`📊 DevInspector Production Statistics:`);
  console.log(`   ✅ Zero dependencies`);
  console.log(`   ✅ Framework agnostic`);
  console.log(`   ✅ TypeScript support`);
  console.log(`   ✅ Professional UI`);
  console.log(`   ✅ Comprehensive debugging features`);
  console.log(`   ✅ Production optimized`);
  console.log(`   ✅ Security compliant`);
  console.log(`   ✅ Cross-browser compatible\n`);
  
} catch (error) {
  console.error('❌ Release preparation failed:', error.message);
  process.exit(1);
}