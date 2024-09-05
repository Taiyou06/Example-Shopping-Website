const express = require('express');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
const PORT = 3000;
const USERS_FILE = path.join(__dirname, 'users.json');

// In-memory storage for cart items
const carts = {}; // key: userId, value: array of cart items

app.use(express.static(path.join(__dirname, 'static')));
app.use(bodyParser.urlencoded({ extended: true }));

// Set up session management
app.use(session({
    secret: 'your_secret_key', // Change this to a real secret key
    resave: false,
    saveUninitialized: false
}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware to check if user is logged in
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    } else {
        res.redirect('/login');
    }
}

// Show cart page
app.get('/cart', isAuthenticated, (req, res) => {
    const userId = req.session.user.username; // Assuming session stores user object
    
    // Retrieve cart items from in-memory storage
    const cartItems = carts[userId] || [];

    // Pass cart items to the EJS template
    res.render('cart', { cartItems: cartItems, user: req.session.user });
});

// Add to cart endpoint
app.post('/cart/add', isAuthenticated, (req, res) => {
    const { productId } = req.body;
    const userId = req.session.user.username; // Assuming session stores user object
    
    if (!carts[userId]) {
        carts[userId] = [];
    }

    // Add productId to user's cart
    carts[userId].push({ productId });
    res.json({ success: true });
});

// Clear cart endpoint
app.post('/cart/clear', isAuthenticated, (req, res) => {
    const userId = req.session.user.username; // Assuming session stores user object
    
    // Clear the user's cart
    carts[userId] = [];
    res.json({ success: true });
});

// Checkout endpoint
app.post('/cart/checkout', isAuthenticated, (req, res) => {
    const userId = req.session.user.username; // Assuming session stores user object
    
    // Retrieve and clear cart items
    const cartItems = carts[userId] || [];
    carts[userId] = []; // Clear cart after checkout

    // Process the checkout here (e.g., save order details)
    res.json({ success: true });
});

// Define products for categories
const categoryProducts = {
    electronics: [
        { id: 1, name: 'iPhone 14', price: 19999.99, image: '/images/electronics1.jpg' },
        { id: 2, name: 'Laptop', price: 25999.99, image: '/images/electronics2.jpg' }
    ],
    food: [
        { id: 3, name: 'Organik Elma/kg', price: 14.49, image: '/images/food1.jpg' },
        { id: 4, name: 'Tam Buğday Ekmeği/adet', price: 9.49, image: '/images/food2.jpg' }
    ],
    health: [
        { id: 5, name: 'Vitamin C', price: 146.49, image: '/images/health1.jpg' },
        { id: 6, name: 'Protein Tozu', price: 339.99, image: '/images/health2.jpg' }
    ]
};

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Home route
app.get('/', (req, res) => {
    const allProducts = [
        ...categoryProducts.electronics,
        ...categoryProducts.food,
        ...categoryProducts.health
    ];
    const productsToDisplay = allProducts.slice(0, 5);
    res.render('index', { user: req.session.user, products: productsToDisplay });
});

// Category route
app.get('/category/:category', (req, res) => {
    const category = req.params.category;
    const products = categoryProducts[category] || [];
    res.render('index', { user: req.session.user, products });
});

// Render pages
app.get('/register', (req, res) => {
    res.render('register', { user: req.session.user });
});

app.get('/login', (req, res) => {
    res.render('login', { user: req.session.user });
});

// Handle user registration
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
        return res.status(400).send('All fields are required');
    }

    let users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
    if (users.find(user => user.username === username)) {
        return res.status(400).send('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ username, email, password: hashedPassword });
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

    res.redirect('/login');
});

// Handle user login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('All fields are required');
    }

    let users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
    const user = users.find(user => user.username === username);

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).send('Invalid username or password');
    }

    req.session.user = user;
    res.redirect('/');
});

// Handle user logout
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Could not log out');
        }
        res.redirect('/');
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
