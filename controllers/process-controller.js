const getConnection = require("../db/database");
const connection = getConnection();

const addnewExpense = (req, res) => {
    const { amount, categoryId, date, description } = req.body;
    const userId = req.user.userId;

    const refImage = req.file ? req.file.path.replace(/\\/g, "/") : null;

    connection.query(
        "INSERT INTO expenses (user_id, category_id, amount, expense_date, description, ref_image) VALUES (?,?,?,?,?,?)",
        [userId, categoryId, amount, date, description, refImage],
        (err, result) => {
            if (err) {
                console.error("Error adding expense:", err);
                return res.status(500).json({ message: "Internal server error" });
            }
            const responseData = { message: "Expense added successfully", expenseId: result.insertId };
            if (refImage) {
                responseData.refImage = `${req.protocol}://${req.get('host')}/${refImage}`;
            }
            res.status(201).json(responseData);
        }
    )
}

const updateExpense = (req, res) => {
    const { expenseId, amount, categoryId, date, description } = req.body;
    const userId = req.user.userId;

    let query = "UPDATE expenses SET amount=?, category_id=?, expense_date=?, description=?";
    let params = [amount, categoryId, date, description];

    if (req.file) {
        query += ", ref_image=?";
        params.push(req.file.path.replace(/\\/g, "/"));
    }

    query += " WHERE user_id=? AND id = ?";
    params.push(userId, expenseId);

    connection.query(
        query,
        params,
        (err, result) => {
            if (err) {
                console.error("Error updating expense:", err);
                return res.status(500).json({ message: "Internal server error" });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Expense not found or unauthorized" });
            }
            const responseData = { message: "Expense updated successfully", expenseId: expenseId };
            if (req.file) {
                responseData.refImage = `${req.protocol}://${req.get('host')}/${req.file.path.replace(/\\/g, "/")}`;
            }
            res.status(200).json(responseData);
        }
    )
}

const deleteExpense = (req, res) => {
    const { expenseId } = req.body;
    const userId = req.user.userId;

    connection.query(
        "DELETE FROM expenses WHERE user_id=? AND id = ?",
        [userId, expenseId],
        (err, result) => {
            if (err) {
                console.error("Error deleting expense:", err);
                return res.status(500).json({ message: "Internal server error" });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Expense not found or unauthorized" });
            }
            res.status(200).json({ message: "Expense deleted successfully", expenseId: expenseId });
        }
    )
}

const getExpenses = (req, res) => {
    const { start, end, limit = 20, offset = 0, search = '' } = req.query;
    const userId = req.user.userId;

    let query = "SELECT e.*, c.name as category_name, c.color_code, c.icon_name FROM expenses e JOIN categories c ON e.category_id = c.id WHERE e.user_id = ?";
    let params = [userId];

    if (start && end) {
        query += " AND e.expense_date BETWEEN ? AND ?";
        params.push(start, end);
    }

    if (search) {
        query += " AND e.description LIKE ?";
        params.push(`%${search}%`);
    }

    query += " ORDER BY e.expense_date DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));

    connection.query(
        query,
        params,
        (err, rows) => {
            if (err) {
                console.error("Error fetching expenses:", err);
                return res.status(500).json({ message: "Internal server error" });
            }
            const expenses = rows.map(expense => {
                if (expense.ref_image) {
                    expense.ref_image = `${req.protocol}://${req.get('host')}/uploads/expenses/${expense.ref_image}`;
                }
                return expense;
            });
            res.status(200).json({ expenses });
        }
    )
}

const getallExpenses = (req, res) => {
    const userId = req.user.userId;

    connection.query(
        "SELECT e.*, c.name as category_name, c.color_code, c.icon_name FROM expenses e JOIN categories c ON e.category_id = c.id WHERE e.user_id = ? ORDER BY e.expense_date DESC",
        [userId],
        (err, rows) => {
            if (err) {
                console.error("Error fetching expenses:", err);
                return res.status(500).json({ message: "Internal server error" });
            }
            const expenses = rows.map(expense => {
                if (expense.ref_image) {
                    expense.ref_image = `${req.protocol}://${req.get('host')}/uploads/expenses/${expense.ref_image}`;
                }
                return expense;
            });
            res.status(200).json({ expenses });
        }
    )
}

const getStatsSummary = (req, res) => {
    const { start, end } = req.query;
    const userId = req.user.userId;

    let query = "SELECT SUM(amount) as total_spent, AVG(amount) as average, COUNT(*) as count FROM expenses WHERE user_id = ?";
    let params = [userId];

    if (start && end) {
        query += " AND expense_date BETWEEN ? AND ?";
        params.push(start, end);
    }

    connection.query(query, params, (err, result) => {
        if (err) {
            console.error("Error fetching stats summary:", err);
            return res.status(500).json({ message: "Internal server error" });
        }
        res.status(200).json(result[0] || { total_spent: 0, average: 0, count: 0 });
    });
}

const getStatsByCategory = (req, res) => {
    const { start, end } = req.query;
    const userId = req.user.userId;

    let query = "SELECT c.name as category, SUM(e.amount) as total, c.color_code, c.icon_name FROM expenses e JOIN categories c ON e.category_id = c.id WHERE e.user_id = ?";
    let params = [userId];

    if (start && end) {
        query += " AND e.expense_date BETWEEN ? AND ?";
        params.push(start, end);
    }

    query += " GROUP BY e.category_id";

    connection.query(query, params, (err, rows) => {
        if (err) {
            console.error("Error fetching stats by category:", err);
            return res.status(500).json({ message: "Internal server error" });
        }
        res.status(200).json(rows);
    });
}

const getStatsTrend = (req, res) => {
    const { start, end, period = 'day' } = req.query;
    const userId = req.user.userId;

    let dateFormat = '%Y-%m-%d'; // default for day
    if (period === 'week') dateFormat = '%Y-%u'; // Year-WeekNumber
    else if (period === 'month') dateFormat = '%Y-%m';
    else if (period === 'year') dateFormat = '%Y';

    let query = `SELECT DATE_FORMAT(expense_date, '${dateFormat}') as date, SUM(amount) as total FROM expenses WHERE user_id = ?`;
    let params = [userId];

    if (start && end) {
        query += " AND expense_date BETWEEN ? AND ?";
        params.push(start, end);
    }

    query += " GROUP BY date ORDER BY date ASC";

    connection.query(query, params, (err, rows) => {
        if (err) {
            console.error("Error fetching stats trend:", err);
            return res.status(500).json({ message: "Internal server error" });
        }
        res.status(200).json(rows);
    });
}

const getCategories = (req, res) => {
    connection.query(
        "SELECT * FROM categories",
        (err, rows) => {
            if (err) {
                console.error("Error fetching categories:", err);
                return res.status(500).json({ message: "Internal server error" });
            }
            res.status(200).json(rows);
        }
    )
}

module.exports = {
    addnewExpense,
    updateExpense,
    deleteExpense,
    getExpenses,
    getallExpenses,
    getStatsSummary,
    getStatsByCategory,
    getStatsTrend,
    getCategories
}
