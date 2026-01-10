const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
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
            users: [],
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
    if (req.session.userId) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
}

// Registration endpoint
app.post('/api/register', async (req, res) => {
    const { username, password, mobile } = req.body;
    
    if (!username || !password || !mobile) {
        return res.status(400).json({ error: 'Username, password, and mobile number are required' });
    }
    
    if (username.length < 3) {
        return res.status(400).json({ error: 'Username must be at least 3 characters' });
    }
    
    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    // Validate mobile number (10 digits)
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(mobile)) {
        return res.status(400).json({ error: 'Mobile number must be exactly 10 digits' });
    }
    
    const data = readDatabase();
    
    // Check if mobile number already exists
    const existingMobile = data.users.find(u => u.mobile === mobile);
    if (existingMobile) {
        return res.status(400).json({ error: 'This mobile number is already registered' });
    }
    
    try {
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create new user
        const newUser = {
            id: Date.now(),
            username: username,
            mobile: mobile,
            password: hashedPassword,
            createdAt: new Date().toISOString()
        };
        
        data.users.push(newUser);
        writeDatabase(data);
        
        res.json({ success: true, message: 'Registration successful' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
    const { mobile, password } = req.body;
    
    if (!mobile || !password) {
        return res.status(400).json({ error: 'Mobile number and password are required' });
    }
    
    const data = readDatabase();
    const user = data.users.find(u => u.mobile === mobile);
    
    if (!user) {
        return res.status(401).json({ error: 'Invalid mobile number or password' });
    }
    
    try {
        // Compare password
        const passwordMatch = await bcrypt.compare(password, user.password);
        
        if (passwordMatch) {
            req.session.userId = user.id;
            req.session.username = user.username;
            req.session.mobile = user.mobile;
            res.json({ success: true });
        } else {
            res.status(401).json({ error: 'Invalid mobile number or password' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Logout endpoint
// Logout endpoint
app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.json({ success: true });
    });
});

// Check authentication
app.get('/api/check-auth', (req, res) => {
    if (req.session.userId) {
        res.json({ authenticated: true, username: req.session.username });
    } else {
        res.json({ authenticated: false });
    }
});

// Get all data (filtered by user)
app.get('/api/data', isAuthenticated, (req, res) => {
    const data = readDatabase();
    const userId = req.session.userId;
    
    const filteredData = {
        familyMembers: data.familyMembers.filter(m => m.userId === userId),
        emis: data.emis.filter(e => e.userId === userId),
        dailyExpenses: data.dailyExpenses.filter(d => d.userId === userId)
    };
    
    res.json(filteredData);
});

// Family Members endpoints
app.post('/api/family-members', isAuthenticated, (req, res) => {
    const data = readDatabase();
    const newMember = {
        id: Date.now(),
        userId: req.session.userId,
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
    const userId = req.session.userId;
    const index = data.familyMembers.findIndex(m => m.id === parseInt(req.params.id) && m.userId === userId);
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
    const userId = req.session.userId;
    data.familyMembers = data.familyMembers.filter(m => !(m.id === parseInt(req.params.id) && m.userId === userId));
    writeDatabase(data);
    res.json({ success: true });
});

// EMI endpoints
app.post('/api/emis', isAuthenticated, (req, res) => {
    const data = readDatabase();
    const newEMI = {
        id: Date.now(),
        userId: req.session.userId,
        itemName: req.body.itemName,
        amount: parseFloat(req.body.amount),
        month: req.body.month,
        year: parseInt(req.body.year),
        startMonth: req.body.startMonth,
        startYear: parseInt(req.body.startYear),
        endMonth: req.body.endMonth,
        endYear: parseInt(req.body.endYear),
        createdAt: new Date().toISOString()
    };
    data.emis.push(newEMI);
    writeDatabase(data);
    res.json(newEMI);
});

app.put('/api/emis/:id', isAuthenticated, (req, res) => {
    const data = readDatabase();
    const userId = req.session.userId;
    const index = data.emis.findIndex(e => e.id === parseInt(req.params.id) && e.userId === userId);
    if (index !== -1) {
        data.emis[index] = {
            ...data.emis[index],
            itemName: req.body.itemName,
            amount: parseFloat(req.body.amount),
            month: req.body.month,
            year: parseInt(req.body.year),
            startMonth: req.body.startMonth,
            startYear: parseInt(req.body.startYear),
            endMonth: req.body.endMonth,
            endYear: parseInt(req.body.endYear)
        };
        writeDatabase(data);
        res.json(data.emis[index]);
    } else {
        res.status(404).json({ error: 'EMI not found' });
    }
});

app.delete('/api/emis/:id', isAuthenticated, (req, res) => {
    const data = readDatabase();
    const userId = req.session.userId;
    data.emis = data.emis.filter(e => !(e.id === parseInt(req.params.id) && e.userId === userId));
    writeDatabase(data);
    res.json({ success: true });
});

// Daily Expenses endpoints
app.post('/api/daily-expenses', isAuthenticated, (req, res) => {
    const data = readDatabase();
    const newExpense = {
        id: Date.now(),
        userId: req.session.userId,
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
    const userId = req.session.userId;
    const index = data.dailyExpenses.findIndex(e => e.id === parseInt(req.params.id) && e.userId === userId);
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
    const userId = req.session.userId;
    data.dailyExpenses = data.dailyExpenses.filter(e => !(e.id === parseInt(req.params.id) && e.userId === userId));
    writeDatabase(data);
    res.json({ success: true });
});

// Start server
initDatabase();
app.listen(PORT, () => {
    console.log(`Bellam Finance Manager running on http://localhost:${PORT}`);
});
