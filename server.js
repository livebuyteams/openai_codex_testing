const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// In-memory products store
const products = [];

// Admin form to add product
app.get('/admin/product/add', (req, res) => {
  res.send(`
    <h1>Add Product</h1>
    <form method="POST" action="/admin/product/add">
      <label>Name: <input name="name" /></label><br/>
      <label>Price: <input name="price" type="number" step="0.01" /></label><br/>
      <button type="submit">Add Product</button>
    </form>
  `);
});

// Handle product creation
app.post('/admin/product/add', (req, res) => {
  const { name, price } = req.body;
  if (!name || !price) {
    return res.status(400).send('Missing name or price');
  }
  products.push({ name, price: parseFloat(price) });
  res.send(`Product ${name} added. <a href="/admin/product/list">View Products</a>`);
});

// List products
app.get('/admin/product/list', (req, res) => {
  const list = products.map(p => `<li>${p.name} - $${p.price.toFixed(2)}</li>`).join('');
  res.send(`<h1>Products</h1><ul>${list}</ul><a href="/admin/product/add">Add another</a>`);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
