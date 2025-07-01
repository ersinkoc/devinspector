import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));
const banner = `/**
 * @oxog/devinspector v${pkg.version}
 * (c) ${new Date().getFullYear()} ${pkg.author}
 * Released under the ${pkg.license} License
 */`;

const baseConfig = {
  input: 'src/simple-index.ts',
  external: [],
  plugins: [
    resolve({
      browser: true,
      preferBuiltins: false
    }),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: false
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
      preventAssignment: true
    })
  ]
};

export default [
  // ESM build
  {
    ...baseConfig,
    output: {
      file: 'dist/devinspector.esm.js',
      format: 'es',
      banner,
      sourcemap: true
    }
  },
  
  // CommonJS build
  {
    ...baseConfig,
    output: {
      file: 'dist/devinspector.cjs.js',
      format: 'cjs',
      banner,
      sourcemap: true,
      exports: 'named'
    }
  },
  
  // UMD build (unminified)
  {
    ...baseConfig,
    output: {
      file: 'dist/devinspector.umd.js',
      format: 'umd',
      name: 'DevInspector',
      banner,
      sourcemap: true,
      globals: {}
    }
  },
  
  // UMD build (minified)
  {
    ...baseConfig,
    plugins: [
      ...baseConfig.plugins,
      terser({
        compress: {
          drop_console: false,
          drop_debugger: true,
          pure_getters: true,
          passes: 2
        },
        format: {
          comments: /^!/
        }
      })
    ],
    output: {
      file: 'dist/devinspector.umd.min.js',
      format: 'umd',
      name: 'DevInspector',
      banner,
      sourcemap: true,
      globals: {}
    }
  }
];