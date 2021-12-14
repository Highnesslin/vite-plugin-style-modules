import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import ts from 'rollup-plugin-typescript2';
import dts from 'rollup-plugin-dts';
import pkg from './package.json';

export default [
  {
    input: './src/index.ts',
    output: [
      { format: 'cjs', file: pkg.main, exports: 'auto' },
      { format: 'esm', file: pkg.module },
    ],
    plugins: [
      commonjs(),
      nodeResolve(),
      ts({
        check: false,
      }),
    ],
  },
  // {
  //   input: './src/type.ts',
  //   output: [{ format: 'es', file: pkg.types }],
  //   plugins: [dts()],
  // },
];
