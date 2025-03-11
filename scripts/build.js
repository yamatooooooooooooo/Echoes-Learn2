const esbuild = require('esbuild');
const { nodeExternalsPlugin } = require('esbuild-node-externals');

async function build() {
  try {
    await esbuild.build({
      entryPoints: ['src/index.tsx'],
      bundle: true,
      minify: true,
      sourcemap: true,
      outdir: 'build',
      target: ['es2020'],
      loader: {
        '.tsx': 'tsx',
        '.ts': 'ts',
        '.js': 'jsx',
        '.svg': 'file',
        '.png': 'file',
        '.jpg': 'file',
        '.gif': 'file'
      },
      plugins: [nodeExternalsPlugin()],
      define: {
        'process.env.NODE_ENV': '"production"'
      }
    });

    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build(); 