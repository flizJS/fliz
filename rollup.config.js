import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';
import scss from 'rollup-plugin-scss';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'umd',
      name: 'FLIZ',
      globals: {
        d3: 'd3'
      }
    },
    {
      file: pkg.module,
      format: 'es',
    },
  ],
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ],
  plugins: [
    typescript({
      typescript: require('typescript'),
      useTsconfigDeclarationDir: true,
    }),
    scss({
      output: true,
      output: 'dist/fliz.css',
      outputStyle: 'compressed'
    })
  ],
}