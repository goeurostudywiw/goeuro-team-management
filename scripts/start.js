const { spawn } = require('child_process');

const port = process.env.PORT || 3005;
console.log(`[GOEURO] Launching Next.js Production Server on port ${port}...`);

const child = spawn('npx', ['next', 'start', '-p', String(port)], {
  stdio: 'inherit',
  shell: true,
});

child.on('error', (err) => {
  console.error('[GOEURO] Failed to start server:', err);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
