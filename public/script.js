document.getElementById('expenseForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const amount = document.getElementById('amount').value;
    const category = document.getElementById('category').value;
    const description = document.getElementById('description').value;
    const date = document.getElementById('date').value;

    const expense = { amount, category, description, date };

    try {
        const res = await fetch('http://localhost:3000/add-expense', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(expense)
        });

        if (res.ok) {
            alert('Expense added successfully!');
            document.getElementById('expenseForm').reset();
        } else {
            alert('Failed to add expense');
        }
    } catch (err) {
        console.error(err);
        alert('Error adding expense');
    }
});

// Fetch All Expenses
async function fetchSummary() {
    try {
        const res = await fetch('http://localhost:3000/summary');
        const data = await res.json();

        const summaryDiv = document.getElementById('summary');
        summaryDiv.innerHTML = '';

        if (!data.data || data.data.length === 0) {
            summaryDiv.innerHTML = '<p>No expenses found.</p>';
            return;
        }

        let table = `
            <p><strong>Total:</strong> $${data.total} | <strong>Count:</strong> ${data.count}</p>
            <table border="1" cellpadding="8" style="width: 100%; border-collapse: collapse;">
                <tr>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Amount</th>
                </tr>
        `;

        data.data.forEach(expense => {
            table += `
                <tr>
                    <td>${expense.date}</td>
                    <td>${expense.category}</td>
                    <td>${expense.description || ''}</td>
                    <td>${expense.amount}</td>
                </tr>
            `;
        });

        table += `</table>`;
        summaryDiv.innerHTML = table;

    } catch (err) {
        console.error(err);
        alert('Error fetching expenses');
    }
}

// Export CSV
async function exportCSV() {
    try {
        const res = await fetch('http://localhost:3000/export-csv');
        if (res.ok) {
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'expenses.csv';
            document.body.appendChild(a);
            a.click();
            a.remove();
        }
    } catch (err) {
        console.error(err);
        alert('Error exporting CSV');
    }
}
