// State management
let currentMonth = '';
let currentYear = 2026;
let editingItem = null;
let editingType = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    initializeYearSelector();
    initializeMonthSelector();
    setupEventListeners();
    loadData();
});

// Check authentication
async function checkAuth() {
    try {
        const response = await fetch('/api/check-auth');
        const data = await response.json();
        if (!data.authenticated) {
            window.location.href = '/index.html';
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        window.location.href = '/index.html';
    }
}

// Initialize year selector
function initializeYearSelector() {
    const yearSelect = document.getElementById('yearSelect');
    const currentYear = new Date().getFullYear();
    
    for (let year = currentYear - 5; year <= currentYear + 5; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        if (year === currentYear) {
            option.selected = true;
        }
        yearSelect.appendChild(option);
    }
}

// Initialize month selector
function initializeMonthSelector() {
    const monthSelect = document.getElementById('monthSelect');
    const currentDate = new Date();
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    
    monthSelect.value = months[currentDate.getMonth()];
    currentMonth = monthSelect.value;
    currentYear = parseInt(document.getElementById('yearSelect').value);
}

// Setup event listeners
function setupEventListeners() {
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // Date selectors
    document.getElementById('monthSelect').addEventListener('change', (e) => {
        currentMonth = e.target.value;
        loadData();
    });
    
    document.getElementById('yearSelect').addEventListener('change', (e) => {
        currentYear = parseInt(e.target.value);
        loadData();
    });
    
    // Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
    
    // Family Members
    document.getElementById('addFamilyBtn').addEventListener('click', () => showForm('family'));
    document.getElementById('saveFamilyBtn').addEventListener('click', saveFamilyMember);
    document.getElementById('cancelFamilyBtn').addEventListener('click', () => hideForm('family'));
    
    // EMIs
    document.getElementById('addEmiBtn').addEventListener('click', () => showForm('emi'));
    document.getElementById('saveEmiBtn').addEventListener('click', saveEmi);
    document.getElementById('cancelEmiBtn').addEventListener('click', () => hideForm('emi'));
    
    // Daily Expenses
    document.getElementById('addExpenseBtn').addEventListener('click', () => showForm('expense'));
    document.getElementById('saveExpenseBtn').addEventListener('click', saveExpense);
    document.getElementById('cancelExpenseBtn').addEventListener('click', () => hideForm('expense'));
}

// Logout
async function logout() {
    try {
        await fetch('/api/logout', { method: 'POST' });
        window.location.href = '/index.html';
    } catch (error) {
        console.error('Logout failed:', error);
    }
}

// Switch tabs
function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

// Load data
async function loadData() {
    try {
        const response = await fetch('/api/data');
        const data = await response.json();
        
        renderFamilyMembers(data.familyMembers);
        renderEmis(data.emis);
        renderDailyExpenses(data.dailyExpenses);
        calculateSummary(data);
    } catch (error) {
        console.error('Failed to load data:', error);
    }
}

// Show form
function showForm(type) {
    editingItem = null;
    editingType = null;
    
    if (type === 'family') {
        document.getElementById('familyForm').style.display = 'block';
        document.getElementById('familyName').value = '';
        document.getElementById('familySalary').value = '';
    } else if (type === 'emi') {
        document.getElementById('emiForm').style.display = 'block';
        document.getElementById('emiItemName').value = '';
        document.getElementById('emiAmount').value = '';
    } else if (type === 'expense') {
        document.getElementById('expenseForm').style.display = 'block';
        document.getElementById('expenseProduct').value = '';
        document.getElementById('expensePrice').value = '';
    }
}

// Hide form
function hideForm(type) {
    if (type === 'family') {
        document.getElementById('familyForm').style.display = 'none';
    } else if (type === 'emi') {
        document.getElementById('emiForm').style.display = 'none';
    } else if (type === 'expense') {
        document.getElementById('expenseForm').style.display = 'none';
    }
    editingItem = null;
    editingType = null;
}

// Save family member
async function saveFamilyMember() {
    const name = document.getElementById('familyName').value.trim();
    const salary = parseFloat(document.getElementById('familySalary').value);
    
    if (!name || !salary || salary <= 0) {
        alert('Please enter valid name and salary');
        return;
    }
    
    try {
        const url = editingItem ? `/api/family-members/${editingItem.id}` : '/api/family-members';
        const method = editingItem ? 'PUT' : 'POST';
        
        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, salary })
        });
        
        hideForm('family');
        loadData();
    } catch (error) {
        console.error('Failed to save family member:', error);
        alert('Failed to save. Please try again.');
    }
}

// Save EMI
async function saveEmi() {
    const itemName = document.getElementById('emiItemName').value.trim();
    const amount = parseFloat(document.getElementById('emiAmount').value);
    
    if (!itemName || !amount || amount <= 0) {
        alert('Please enter valid item name and amount');
        return;
    }
    
    try {
        const url = editingItem ? `/api/emis/${editingItem.id}` : '/api/emis';
        const method = editingItem ? 'PUT' : 'POST';
        
        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                itemName, 
                amount, 
                month: currentMonth, 
                year: currentYear 
            })
        });
        
        hideForm('emi');
        loadData();
    } catch (error) {
        console.error('Failed to save EMI:', error);
        alert('Failed to save. Please try again.');
    }
}

// Save expense
async function saveExpense() {
    const productName = document.getElementById('expenseProduct').value.trim();
    const price = parseFloat(document.getElementById('expensePrice').value);
    
    if (!productName || !price || price <= 0) {
        alert('Please enter valid product name and price');
        return;
    }
    
    try {
        const url = editingItem ? `/api/daily-expenses/${editingItem.id}` : '/api/daily-expenses';
        const method = editingItem ? 'PUT' : 'POST';
        
        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                productName, 
                price, 
                month: currentMonth, 
                year: currentYear 
            })
        });
        
        hideForm('expense');
        loadData();
    } catch (error) {
        console.error('Failed to save expense:', error);
        alert('Failed to save. Please try again.');
    }
}

// Edit family member
function editFamilyMember(member) {
    editingItem = member;
    editingType = 'family';
    
    document.getElementById('familyForm').style.display = 'block';
    document.getElementById('familyName').value = member.name;
    document.getElementById('familySalary').value = member.salary;
}

// Edit EMI
function editEmi(emi) {
    editingItem = emi;
    editingType = 'emi';
    
    document.getElementById('emiForm').style.display = 'block';
    document.getElementById('emiItemName').value = emi.itemName;
    document.getElementById('emiAmount').value = emi.amount;
}

// Edit expense
function editExpense(expense) {
    editingItem = expense;
    editingType = 'expense';
    
    document.getElementById('expenseForm').style.display = 'block';
    document.getElementById('expenseProduct').value = expense.productName;
    document.getElementById('expensePrice').value = expense.price;
}

// Delete family member
async function deleteFamilyMember(id) {
    if (!confirm('Are you sure you want to delete this family member?')) return;
    
    try {
        await fetch(`/api/family-members/${id}`, { method: 'DELETE' });
        loadData();
    } catch (error) {
        console.error('Failed to delete:', error);
        alert('Failed to delete. Please try again.');
    }
}

// Delete EMI
async function deleteEmi(id) {
    if (!confirm('Are you sure you want to delete this EMI?')) return;
    
    try {
        await fetch(`/api/emis/${id}`, { method: 'DELETE' });
        loadData();
    } catch (error) {
        console.error('Failed to delete:', error);
        alert('Failed to delete. Please try again.');
    }
}

// Delete expense
async function deleteExpense(id) {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    
    try {
        await fetch(`/api/daily-expenses/${id}`, { method: 'DELETE' });
        loadData();
    } catch (error) {
        console.error('Failed to delete:', error);
        alert('Failed to delete. Please try again.');
    }
}

// Render family members
function renderFamilyMembers(members) {
    const container = document.getElementById('familyList');
    
    if (members.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No family members added yet. Click "Add Member" to get started.</p></div>';
        return;
    }
    
    container.innerHTML = members.map(member => `
        <div class="list-item">
            <div class="list-item-content">
                <div class="list-item-title">${member.name}</div>
            </div>
            <div class="list-item-amount">₹${member.salary.toLocaleString('en-IN')}</div>
            <div class="list-item-actions">
                <button class="btn btn-success btn-small" onclick="editFamilyMember(${JSON.stringify(member).replace(/"/g, '&quot;')})">Edit</button>
                <button class="btn btn-danger btn-small" onclick="deleteFamilyMember(${member.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

// Render EMIs
function renderEmis(emis) {
    const container = document.getElementById('emiList');
    const filtered = emis.filter(e => e.month === currentMonth && e.year === currentYear);
    
    if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No EMIs for this month. Click "Add EMI" to add one.</p></div>';
        return;
    }
    
    container.innerHTML = filtered.map(emi => `
        <div class="list-item">
            <div class="list-item-content">
                <div class="list-item-title">${emi.itemName}</div>
                <div class="list-item-detail">${emi.month} ${emi.year}</div>
            </div>
            <div class="list-item-amount">₹${emi.amount.toLocaleString('en-IN')}</div>
            <div class="list-item-actions">
                <button class="btn btn-success btn-small" onclick="editEmi(${JSON.stringify(emi).replace(/"/g, '&quot;')})">Edit</button>
                <button class="btn btn-danger btn-small" onclick="deleteEmi(${emi.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

// Render daily expenses
function renderDailyExpenses(expenses) {
    const container = document.getElementById('expenseList');
    const filtered = expenses.filter(e => e.month === currentMonth && e.year === currentYear);
    
    if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No expenses recorded for this month. Click "Add Expense" to add one.</p></div>';
        return;
    }
    
    container.innerHTML = filtered.map(expense => `
        <div class="list-item">
            <div class="list-item-content">
                <div class="list-item-title">${expense.productName}</div>
                <div class="list-item-detail">${expense.month} ${expense.year}</div>
            </div>
            <div class="list-item-amount">₹${expense.price.toLocaleString('en-IN')}</div>
            <div class="list-item-actions">
                <button class="btn btn-success btn-small" onclick="editExpense(${JSON.stringify(expense).replace(/"/g, '&quot;')})">Edit</button>
                <button class="btn btn-danger btn-small" onclick="deleteExpense(${expense.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

// Calculate summary
function calculateSummary(data) {
    // Total salary
    const totalSalary = data.familyMembers.reduce((sum, member) => sum + member.salary, 0);
    
    // Total EMI for current month
    const totalEmi = data.emis
        .filter(e => e.month === currentMonth && e.year === currentYear)
        .reduce((sum, emi) => sum + emi.amount, 0);
    
    // Total expenses for current month
    const totalExpenses = data.dailyExpenses
        .filter(e => e.month === currentMonth && e.year === currentYear)
        .reduce((sum, expense) => sum + expense.price, 0);
    
    // Calculate totals
    const totalSpent = totalEmi + totalExpenses;
    const remaining = totalSalary - totalSpent;
    const savings = remaining;
    
    // Update UI
    document.getElementById('totalSalary').textContent = `₹${totalSalary.toLocaleString('en-IN')}`;
    document.getElementById('totalSpent').textContent = `₹${totalSpent.toLocaleString('en-IN')}`;
    document.getElementById('remaining').textContent = `₹${remaining.toLocaleString('en-IN')}`;
    document.getElementById('savings').textContent = `₹${savings.toLocaleString('en-IN')}`;
    
    // Calculate grade and instructions
    if (totalSalary > 0) {
        const savingsPercentage = (savings / totalSalary) * 100;
        const { grade, instructions } = getGradeAndInstructions(savingsPercentage, savings);
        
        const gradeElement = document.getElementById('grade');
        gradeElement.textContent = `Grade: ${grade}`;
        gradeElement.className = `grade grade-${grade}`;
        
        document.getElementById('instructions').textContent = instructions;
        document.getElementById('instructionsCard').style.display = 'block';
    } else {
        document.getElementById('instructionsCard').style.display = 'none';
    }
}

// Get grade and instructions based on savings percentage
function getGradeAndInstructions(savingsPercentage, savings) {
    let grade, instructions;
    
    if (savingsPercentage >= 50) {
        grade = 'A';
        instructions = '🎉 Excellent! You are saving more than 50% of your income. This is outstanding financial management. Consider investing your savings in mutual funds, stocks, or fixed deposits for long-term wealth creation.';
    } else if (savingsPercentage >= 30) {
        grade = 'B';
        instructions = '👍 Great job! You are saving 30-50% of your income. This is a healthy savings rate. Try to maintain this consistency and look for opportunities to reduce unnecessary expenses.';
    } else if (savingsPercentage >= 15) {
        grade = 'C';
        instructions = '👌 Good effort! You are saving 15-30% of your income. This is acceptable, but there is room for improvement. Review your daily expenses and EMIs to find areas where you can cut back.';
    } else if (savingsPercentage >= 0) {
        grade = 'D';
        instructions = '⚠️ Warning! You are saving less than 15% of your income. This is concerning for financial stability. Urgently review all expenses, eliminate non-essential spending, and consider ways to increase income.';
    } else {
        grade = 'F';
        instructions = '🚨 Critical! You are spending more than you earn. This is financially unsustainable. Immediately cut all non-essential expenses, postpone EMIs if possible, and seek additional income sources. Consider financial counseling.';
    }
    
    return { grade, instructions };
}

// Make functions globally accessible
window.editFamilyMember = editFamilyMember;
window.deleteFamilyMember = deleteFamilyMember;
window.editEmi = editEmi;
window.deleteEmi = deleteEmi;
window.editExpense = editExpense;
window.deleteExpense = deleteExpense;
