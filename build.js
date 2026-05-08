const babel = require('@babel/core');
const fs = require('fs');
const path = require('path');

// Load .env if present
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) process.env[k.trim()] = v.join('=').trim();
  });
}

const ANTHROPIC_KEY = process.env.ANTHROPIC_KEY || '';
if (!ANTHROPIC_KEY) console.warn('WARNING: No ANTHROPIC_KEY in .env — AI features will not work.');

const SRC = path.join(__dirname, 'src', 'app.jsx');
const OUT = path.join(__dirname, 'index.html');

const jsxSource = fs.readFileSync(SRC, 'utf8');
console.log(`Compiling ${SRC} (${Math.round(jsxSource.length / 1024)}KB)...`);

const result = babel.transformSync(jsxSource, {
  presets: [['@babel/preset-react', { runtime: 'classic' }]],
  comments: false,
  compact: false,
});

const compiled = result.code;
console.log(`Compiled output: ${Math.round(compiled.length / 1024)}KB`);

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="theme-color" content="#1a1a1a" />
  <title>Temple</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { height: 100%; }
    body { background: #1a1a1a; color: #f0ece4; font-family: 'Atkinson Hyperlegible', Georgia, sans-serif; -webkit-font-smoothing: antialiased; }
    #root { max-width: 480px; margin: 0 auto; min-height: 100%; }
    input, textarea, select, button { font-family: inherit; }
    * { -webkit-tap-highlight-color: transparent; }
    #loading { position: fixed; inset: 0; background: #1a1a1a; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 16px; z-index: 9999; }
    #loading-title { font-size: 28px; font-weight: 700; color: #e8a020; letter-spacing: 4px; }
    #loading-sub { font-size: 14px; color: #888; }
  </style>
  <script>window.__TEMPLE_AI_KEY__=${JSON.stringify(ANTHROPIC_KEY)};</script>
</head>
<body>
  <div id="loading"><div id="loading-title">TEMPLE</div><div id="loading-sub">Loading...</div></div>
  <div id="root"></div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js"></script>
  <script>
${compiled}
  </script>
</body>
</html>`;

fs.writeFileSync(OUT, html, 'utf8');
const outSize = fs.statSync(OUT).size;
console.log(`Output: ${OUT} (${Math.round(outSize / 1024)}KB)`);
console.log('Build complete.');
