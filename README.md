# 🏠 Bellam Family Finance Manager

A comprehensive web application for managing family finances, tracking salaries, EMIs, and daily expenses with intelligent savings insights.

## ✨ Features

- **Multi-User Support**: Each user can create their own account with a unique username and password
- **Secure Authentication**: Passwords are securely hashed using bcrypt
- **Data Isolation**: Each user sees only their own financial data
- **User Registration**: Easy sign-up process with password confirmation
- **Family Member Management**: Add multiple family members with their salaries
- **EMI Tracking**: Track monthly EMIs for various items (home loans, car loans, etc.)
- **Daily Expense Tracking**: Record daily expenses like groceries and utilities
- **Smart Financial Summary**: 
  - View total salary, spent amount, and remaining balance
  - Get savings grade (A-F) based on your savings percentage
  - Receive personalized financial advice
- **Month/Year Selection**: Filter and view data by specific months and years
- **Data Persistence**: All data is saved in a database and persists after refresh
- **Modern UI**: Beautiful, mobile-friendly interface inspired by Kokonut design
- **Full CRUD Operations**: Edit and delete any entry

## 🔐 Getting Started

### First Time Users

1. Open the application in your browser at `http://localhost:3000`
2. Click on the "**Sign Up**" tab
3. Enter a username (at least 3 characters)
4. Enter a password (at least 6 characters)
5. Confirm your password
6. Click "**Create Account**"
7. After successful registration, you'll be automatically redirected to sign in
8. Enter your credentials and click "**Sign In**"

### Existing Users

1. Open the application at `http://localhost:3000`
2. Enter your username
3. Enter your password
4. Click "**Sign In**"

## 🚀 Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

### Installation Steps

1. **Navigate to the project directory**:
   ```bash
   cd c:\Users\kalya\OneDrive\Desktop\finance
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the application**:
   ```bash
   npm start
   ```

4. **Open your browser** and visit:
   ```
   http://localhost:3000
   ```

## 📱 How to Use

### Creating Your Account
1. Open the application in your browser
2. Click the "**Sign Up**" tab
3. Choose a unique username (minimum 3 characters)
4. Create a strong password (minimum 6 characters)
5. Re-enter your password to confirm
6. Click "**Create Account**"
7. Once registered, sign in with your credentials

### Signing In
1. Enter your username
2. Enter your password
3. Click "**Sign In**"

### Important: Data Privacy
- Each user has their own private data
- You can only see and manage your own financial information
- Other users cannot access your data

### Managing Family Members
1. Click on "👨‍👩‍👧‍👦 Family Members" tab
2. Click "+ Add Member" button
3. Enter member name and monthly salary
4. Click "Save"
5. Use "Edit" or "Delete" buttons to modify entries

### Adding EMIs
1. Click on "🏦 EMIs" tab
2. Click "+ Add EMI" button
3. Enter item name (e.g., "Home Loan", "Car Loan")
4. Enter monthly EMI amount
5. Click "Save"
6. EMIs are automatically associated with the selected month/year

### Recording Daily Expenses
1. Click on "🛒 Daily Expenses" tab
2. Click "+ Add Expense" button
3. Enter product name (e.g., "Groceries", "Electricity Bill")
4. Enter price
5. Click "Save"
6. Expenses are tracked for the selected month/year

### Understanding Your Financial Summary

The dashboard displays four key metrics:

1. **Total Salary**: Sum of all family members' salaries
2. **Total Spent**: EMIs + Daily Expenses for the selected month
3. **Remaining**: Total Salary - Total Spent
4. **Savings**: Same as remaining amount with grade

### Savings Grade System

- **Grade A (50%+ savings)**: Excellent financial management
- **Grade B (30-50% savings)**: Great job, healthy savings rate
- **Grade C (15-30% savings)**: Good, but room for improvement
- **Grade D (0-15% savings)**: Warning, need to reduce expenses
- **Grade F (Negative savings)**: Critical, spending more than earning

## 🗂️ Project Structure

```
finance/
├── server.js              # Express backend server
├── package.json          # Project dependencies
├── database.json         # JSON database (auto-created)
└── public/
    ├── index.html        # Login page
    ├── dashboard.html    # Main dashboard
    ├── styles.css        # Modern styling
    └── app.js            # Frontend JavaScript
```

## 💾 Data Storage

- All data is stored in `database.json` file
- Data persists across browser refreshes and server restarts
- Each user's data is isolated and secure
- User passwords are hashed using bcrypt for security
- Automatic backup on every change

## 🎨 Design Features

- Modern, clean interface inspired by Kokonut
- Fully responsive (works on mobile, tablet, and desktop)
- Smooth animations and transitions
- Color-coded financial indicators
- Intuitive tab navigation

## 🛠️ Technologies Used

- **Backend**: Node.js, Express.js
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Database**: JSON file storage
- **Authentication**: Express sessions with bcrypt password hashing
- **Security**: Password hashing, session management, data isolation

## 📊 Month/Year Filtering

Use the month and year selectors at the top to:
- View EMIs and expenses for specific months
- Track financial progress over time
- Compare different months

## 🔄 Edit & Delete

Every entry (family member, EMI, expense) has:
- **Edit button**: Modify existing entries
- **Delete button**: Remove entries with confirmation

## 🌐 Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## 📝 Tips for Best Use

1. Add all family members first to see accurate total salary
2. Record EMIs at the start of each month
3. Add daily expenses regularly (ideally daily or weekly)
4. Review the financial advice to improve your savings
5. Use month/year selector to track historical data
6. Aim for Grade A or B for financial security

## 🆘 Troubleshooting

**Application won't start:**
- Make sure Node.js is installed: `node --version`
- Install dependencies: `npm install`

**Can't register:**
- Make sure username is at least 3 characters
- Make sure password is at least 6 characters
- Check that passwords match
- Username might already be taken - try a different one

**Can't login:**
- Verify you're using the correct credentials
- Username and password are case-sensitive
- If you forgot your password, contact the administrator

**Registration not working:**
- Clear browser cookies and cache
- Make sure the server is running
- Check console for error messages

**Data not saving:**
- Check if `database.json` file has write permissions
- Ensure the server is running

**Port already in use:**
- Another application might be using port 8080
- Stop other applications or change the PORT in server.js

## 📄 License

MIT License - Feel free to use and modify for your family's needs.

## 👨‍💻 Support

For issues or questions about the Bellam Family Finance Manager, please review this README or check the application's error messages.

---

**Made with ❤️ for the Bellam Family**
