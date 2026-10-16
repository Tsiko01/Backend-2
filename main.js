
const express = require('express');
const fs = require('fs/promises');
const path = require('path');

const app = express();
const PORT = 3000;
const FILE_PATH = path.join(__dirname, 'products.json');

app.use(express.json());

async function readProducts() {
    const data = await fs.readFile(FILE_PATH, 'utf-8');
    return JSON.parse(data);
}

async function saveProducts(products) {
    await fs.writeFile(
        FILE_PATH,
        JSON.stringify(products, null, 2)
    );
}

app.post('/products', async (req, res) => {
    try {
        const { name, price, quantity } = req.body;

        if (
            typeof name !== 'string' ||
            !name.trim() ||
            typeof price !== 'number' ||
            !Number.isFinite(price) ||
            price < 0 ||
            !Number.isInteger(quantity) ||
            quantity < 0
        ) {
            return res.status(400).json({
                message: 'Name, valid price and quantity are required'
            });
        }

        const products = await readProducts();

        const newProduct = {
            id: products.length
                ? Math.max(...products.map(p => p.id)) + 1
                : 1,
            name: name.trim(),
            price,
            quantity
        };

        products.push(newProduct);
        await saveProducts(products);

        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});


app.get('/products', async (req, res) => {
    try {
        const products = await readProducts();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});


app.get('/products/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).json({
                message: 'Invalid product ID'
            });
        }

        const products = await readProducts();
        const product = products.find(p => p.id === id);

        if (!product) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.put('/products/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { name, price, quantity } = req.body;

        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).json({
                message: 'Invalid product ID'
            });
        }

        if (
            typeof name !== 'string' ||
            !name.trim() ||
            typeof price !== 'number' ||
            !Number.isFinite(price) ||
            price < 0 ||
            !Number.isInteger(quantity) ||
            quantity < 0
        ) {
            return res.status(400).json({
                message: 'Name, valid price and quantity are required'
            });
        }

        const products = await readProducts();
        const index = products.findIndex(p => p.id === id);

        if (index === -1) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        products[index] = {
            id,
            name: name.trim(),
            price,
            quantity
        };

        await saveProducts(products);

        res.json(products[index]);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.delete('/products/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).json({
                message: 'Invalid product ID'
            });
        }

        const products = await readProducts();
        const index = products.findIndex(p => p.id === id);

        if (index === -1) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        const deletedProduct = products.splice(index, 1)[0];

        await saveProducts(products);

        res.json({
            message: 'Product deleted successfully',
            product: deletedProduct
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});


app.get('/products/search/:name', async (req, res) => {
    try {
        const products = await readProducts();

        const searchName = req.params.name.toLowerCase();

        const results = products.filter(product =>
            product.name.toLowerCase().includes(searchName)
        );

        res.json(results);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
