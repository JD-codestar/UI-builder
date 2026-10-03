import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
  const reqPath = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  let distPath = path.join(__dirname, 'dist', reqPath);
  let rootPath = path.join(__dirname, reqPath);
  
  let targetPath = fs.existsSync(distPath) ? distPath : rootPath;
  const extname = String(path.extname(targetPath)).toLowerCase();
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';

  fs.readFile(targetPath, (error, content) => {
    if (error) {
      const fallbackPath = fs.existsSync(path.join(__dirname, 'dist', 'index.html'))
        ? path.join(__dirname, 'dist', 'index.html')
        : path.join(__dirname, 'index.html');

      fs.readFile(fallbackPath, (err, html) => {
        if (err) {
          res.writeHead(500);
          res.end('Server Error loading entry point');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
          res.end(html, 'utf-8');
        }
      });
    } else {
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Bolt AI Web Builder running at http://localhost:${PORT}`);
});
