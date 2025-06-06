const http = require('http');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data', 'products.json');

let products = [];

function loadProducts() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    products = JSON.parse(data);
  } catch (err) {
    products = [];
  }
}

function saveProducts() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2));
}

const PORT = process.env.PORT || 3000;

loadProducts();

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  // GET / - serve homepage
  if (req.method === 'GET' && req.url === '/') {
    return serveStatic('public/index.html', res);
  }

  // GET /products - dynamic product list
  if (req.method === 'GET' && req.url === '/products') {
    const list = products
      .map(p => `<li>${p.name} - $${p.price}</li>`)
      .join('\n');
    const html = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <title>商品列表</title>
</head>
<body>
  <h1>商品列表</h1>
  <ul>${list}</ul>
  <a href="/">回到首頁</a>
</body>
</html>`;
    res.writeHead(200, { 'Content-Type': 'text/html' });
    return res.end(html);
  }

  // GET /admin - serve admin page
  if (req.method === 'GET' && req.url === '/admin') {
    return serveStatic('public/admin.html', res);
  }

  // API routes
  if (req.url === '/api/products') {
    if (req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(products));
    }

    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => (body += chunk));
      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          if (data.name && data.price) {
            products.push({ name: data.name, price: Number(data.price) });
            saveProducts();
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
          } else {
            res.writeHead(400);
            res.end('Invalid Data');
          }
        } catch (e) {
          res.writeHead(400);
          res.end('Invalid JSON');
        }
      });
      return;
    }
  }

  // static file serving for other assets
  const staticPath = path.join('public', req.url);
  if (req.method === 'GET' && fs.existsSync(staticPath) && fs.lstatSync(staticPath).isFile()) {
    return serveStatic(staticPath, res);
  }

  res.writeHead(404);
  res.end('Not Found');
});

function serveStatic(filePath, res) {
  const ext = path.extname(filePath);
  let contentType = 'text/html';
  if (ext === '.js') contentType = 'text/javascript';
  else if (ext === '.css') contentType = 'text/css';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
