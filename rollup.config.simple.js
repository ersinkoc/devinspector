import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import replace from '@rollup/plugin-replace';

const banner = `/**
 * @oxog/devinspector v1.1.0
 * Professional developer inspector tool with beautiful modern UI
 * @license MIT
 */`;

export default [
  // ESM build
  {
    input: 'src/index-simple.ts',
    output: {
      file: 'dist/devinspector.esm.js',
      format: 'es',
      banner,
      sourcemap: true
    },
    plugins: [
      typescript({
        tsconfig: 'tsconfig.json',
        declaration: false,
        declarationMap: false
      }),
      nodeResolve(),
      commonjs(),
      replace({
        'process.env.NODE_ENV': JSON.stringify('production'),
        preventAssignment: true
      })
    ]
  },
  
  // CommonJS build
  {
    input: 'src/index-simple.ts',
    output: {
      file: 'dist/devinspector.cjs.js',
      format: 'cjs',
      banner,
      sourcemap: true,
      exports: 'auto'
    },
    plugins: [
      typescript({
        tsconfig: 'tsconfig.json',
        declaration: false,
        declarationMap: false
      }),
      nodeResolve(),
      commonjs(),
      replace({
        'process.env.NODE_ENV': JSON.stringify('production'),
        preventAssignment: true
      })
    ]
  },
  
  // UMD build
  {
    input: 'src/index-simple.ts',
    output: {
      file: 'dist/devinspector.umd.js',
      format: 'umd',
      name: 'DevInspector',
      banner,
      sourcemap: true
    },
    plugins: [
      typescript({
        tsconfig: 'tsconfig.json',
        declaration: false,
        declarationMap: false
      }),
      nodeResolve(),
      commonjs(),
      replace({
        'process.env.NODE_ENV': JSON.stringify('production'),
        preventAssignment: true
      })
    ]
  },
  
  // UMD minified build
  {
    input: 'src/index-simple.ts',
    output: {
      file: 'dist/devinspector.umd.min.js',
      format: 'umd',
      name: 'DevInspector',
      banner,
      sourcemap: true
    },
    plugins: [
      typescript({
        tsconfig: 'tsconfig.json',
        declaration: false,
        declarationMap: false
      }),
      nodeResolve(),
      commonjs(),
      replace({
        'process.env.NODE_ENV': JSON.stringify('production'),
        preventAssignment: true
      }),
      terser({
        compress: {
          drop_console: false,
          drop_debugger: true
        },
        format: {
          comments: function(node, comment) {
            return comment.value.includes('@license') || comment.value.includes('@oxog/devinspector');
          }
        }
      })
    ]
  }
];