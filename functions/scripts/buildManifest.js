const fs = require('fs');
const path = require('path');

async function buildManifest() {
  const rootDir = path.resolve(__dirname, '..');
  const loader = require(path.join(rootDir, 'node_modules', 'firebase-functions', 'lib', 'runtime', 'loader.js'));
  const manifest = require(path.join(rootDir, 'node_modules', 'firebase-functions', 'lib', 'runtime', 'manifest.js'));
  
  const stack = await loader.loadStack(rootDir);
  const wire = manifest.stackToWire(stack);
  const targetPath = path.join(rootDir, 'functions.yaml');
  fs.writeFileSync(targetPath, JSON.stringify(wire, null, 2), 'utf8');
  console.log(`[manifest] Successfully generated functions.yaml with ${Object.keys(wire.endpoints || {}).length} endpoints.`);
}

buildManifest().catch((err) => {
  console.error('[manifest] Error generating functions.yaml:', err);
  process.exit(1);
});
