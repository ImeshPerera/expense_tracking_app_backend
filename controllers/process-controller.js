const getConnection = require("../db/database");
const connection = getConnection();

const addnewExpense = (req, res) => {
    const { amount, category, date, description } = req.body;
    const userId = req.user.userId;

    const refImage = req.file ? req.file.path.replace(/\\/g, "/") : null;

    connection.query(
        "INSERT INTO expenses (user_id, amount, category, expense_date, description, ref_image) VALUES (?,?,?,?,?,?)",
        [userId, amount, category, date, description, refImage],
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
    const { expenseId, amount, category, date, description } = req.body;
    const userId = req.user.userId;

    let query = "UPDATE expenses SET amount=?, category=?, expense_date=?, description=?";
    let params = [amount, category, date, description];

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
    const { startDate, endDate } = req.body;
    const userId = req.user.userId;

    connection.query(
        "SELECT * FROM expenses WHERE user_id=? AND expense_date BETWEEN ? AND ?",
        [userId, startDate, endDate],
        (err, rows) => {
            if (err) {
                console.error("Error fetching expenses:", err);
                return res.status(500).json({ message: "Internal server error" });
            }
            const expenses = rows.map(expense => {
                if (expense.ref_image) {
                    expense.ref_image = `${req.protocol}://${req.get('host')}/${expense.ref_image}`;
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
        "SELECT * FROM expenses WHERE user_id=?",
        [userId],
        (err, rows) => {
            if (err) {
                console.error("Error fetching expenses:", err);
                return res.status(500).json({ message: "Internal server error" });
            }
            const expenses = rows.map(expense => {
                if (expense.ref_image) {
                    expense.ref_image = `${req.protocol}://${req.get('host')}/${expense.ref_image}`;
                }
                return expense;
            });
            res.status(200).json({ expenses });
        }
    )
}

module.exports = {
    addnewExpense,
    updateExpense,
    deleteExpense,
    getExpenses,
    getallExpenses
}
