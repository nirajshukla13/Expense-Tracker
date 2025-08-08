const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

const DATA_FILE = path.join(__dirname, 'data', 'expenses.json');

// Ensure data file exists
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, '[]', 'utf-8');
}

// Add expense
app.post('/add-expense', (req, res) => {
  const { amount, category, description, date } = req.body;

  const newExpense = {
    amount: parseFloat(amount),
    category,
    description,
    date: date || new Date().toISOString().split('T')[0]
  };

  const expenses = JSON.parse(fs.readFileSync(DATA_FILE));
  expenses.push(newExpense);
  fs.writeFileSync(DATA_FILE, JSON.stringify(expenses, null, 2));

  res.json({ message: 'Expense added', expense: newExpense });
});

// Summary
app.get('/summary', (req, res) => {
  const { from, to, category } = req.query;
  let expenses = JSON.parse(fs.readFileSync(DATA_FILE));

  if (from && to) {
    expenses = expenses.filter(e => e.date >= from && e.date <= to);
  }
  if (category) {
    expenses = expenses.filter(e => e.category.toLowerCase() === category.toLowerCase());
  }

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  res.json({ total, count: expenses.length, data: expenses });
});

// Export CSV
app.get('/export-csv', (req, res) => {
  const expenses = JSON.parse(fs.readFileSync(DATA_FILE));

  const csvPath = path.join(__dirname, 'exports', 'expenses.csv');
  fs.mkdirSync(path.join(__dirname, 'exports'), { recursive: true });

  const csvWriter = createCsvWriter({
    path: csvPath,
    header: [
      { id: 'date', title: 'Date' },
      { id: 'category', title: 'Category' },
      { id: 'description', title: 'Description' },
      { id: 'amount', title: 'Amount' }
    ]
  });

  csvWriter.writeRecords(expenses).then(() => {
    res.download(csvPath);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
