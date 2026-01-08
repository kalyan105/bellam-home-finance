const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 8080;
const DB_FILE = path.join(__dirname, 'database.json');

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
    secret: 'bellam-finance-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// Initialize database
function initDatabase() {
    if (!fs.existsSync(DB_FILE)) {
        const initialData = {
            familyMembers: [],
            emis: [],
            dailyExpenses: []
        };
        fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
    }
}

// Read database
function readDatabase() {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
}

// Write database
function writeDatabase(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Authentication middleware
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
}

// Login endpoint
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    if (username === 'BELLAM' && password === 'Bellam@123') {
        req.session.user = username;
        res.json({ success: true });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// Check authentication
app.get('/api/check-auth', (req, res) => {
    if (req.session.user) {
        res.json({ authenticated: true });
    } else {
        res.json({ authenticated: false });
    }
});

// Get all data
app.get('/api/data', isAuthenticated, (req, res) => {
    const data = readDatabase();
    res.json(data);
});

// Family Members endpoints
app.post('/api/family-members', isAuthenticated, (req, res) => {
    const data = readDatabase();
    const newMember = {
        id: Date.now(),
        name: req.body.name,
        salary: parseFloat(req.body.salary),
        createdAt: new Date().toISOString()
    };
    data.familyMembers.push(newMember);
    writeDatabase(data);
    res.json(newMember);
});

app.put('/api/family-members/:id', isAuthenticated, (req, res) => {
    const data = readDatabase();
    const index = data.familyMembers.findIndex(m => m.id === parseInt(req.params.id));
    if (index !== -1) {
        data.familyMembers[index] = {
            ...data.familyMembers[index],
            name: req.body.name,
            salary: parseFloat(req.body.salary)
        };
        writeDatabase(data);
        res.json(data.familyMembers[index]);
    } else {
        res.status(404).json({ error: 'Member not found' });
    }
});

app.delete('/api/family-members/:id', isAuthenticated, (req, res) => {
    const data = readDatabase();
    data.familyMembers = data.familyMembers.filter(m => m.id !== parseInt(req.params.id));
    writeDatabase(data);
    res.json({ success: true });
});

// EMI endpoints
app.post('/api/emis', isAuthenticated, (req, res) => {
    const data = readDatabase();
    const newEMI = {
        id: Date.now(),
        itemName: req.body.itemName,
        amount: parseFloat(req.body.amount),
        month: req.body.month,
        year: parseInt(req.body.year),
        createdAt: new Date().toISOString()
    };
    data.emis.push(newEMI);
    writeDatabase(data);
    res.json(newEMI);
});

app.put('/api/emis/:id', isAuthenticated, (req, res) => {
    const data = readDatabase();
    const index = data.emis.findIndex(e => e.id === parseInt(req.params.id));
    if (index !== -1) {
        data.emis[index] = {
            ...data.emis[index],
            itemName: req.body.itemName,
            amount: parseFloat(req.body.amount),
            month: req.body.month,
            year: parseInt(req.body.year)
        };
        writeDatabase(data);
        res.json(data.emis[index]);
    } else {
        res.status(404).json({ error: 'EMI not found' });
    }
});

app.delete('/api/emis/:id', isAuthenticated, (req, res) => {
    const data = readDatabase();
    data.emis = data.emis.filter(e => e.id !== parseInt(req.params.id));
    writeDatabase(data);
    res.json({ success: true });
});

// Daily Expenses endpoints
app.post('/api/daily-expenses', isAuthenticated, (req, res) => {
    const data = readDatabase();
    const newExpense = {
        id: Date.now(),
        productName: req.body.productName,
        price: parseFloat(req.body.price),
        month: req.body.month,
        year: parseInt(req.body.year),
        createdAt: new Date().toISOString()
    };
    data.dailyExpenses.push(newExpense);
    writeDatabase(data);
    res.json(newExpense);
});

app.put('/api/daily-expenses/:id', isAuthenticated, (req, res) => {
    const data = readDatabase();
    const index = data.dailyExpenses.findIndex(e => e.id === parseInt(req.params.id));
    if (index !== -1) {
        data.dailyExpenses[index] = {
            ...data.dailyExpenses[index],
            productName: req.body.productName,
            price: parseFloat(req.body.price),
            month: req.body.month,
            year: parseInt(req.body.year)
        };
        writeDatabase(data);
        res.json(data.dailyExpenses[index]);
    } else {
        res.status(404).json({ error: 'Expense not found' });
    }
});

app.delete('/api/daily-expenses/:id', isAuthenticated, (req, res) => {
    const data = readDatabase();
    data.dailyExpenses = data.dailyExpenses.filter(e => e.id !== parseInt(req.params.id));
    writeDatabase(data);
    res.json({ success: true });
});

// Start server
initDatabase();
app.listen(PORT, () => {
    console.log(`Bellam Finance Manager running on http://localhost:${PORT}`);
});
