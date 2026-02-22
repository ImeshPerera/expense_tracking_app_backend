const getConnection = require("../db/database");
const connection = getConnection();

const addnewExpense = (req, res) => {
    const { amount, category, date, description } = req.body;
    const userId = req.user.userId;
    
    connection.query(
        "INSERT INTO expenses (user_id, amount, category, date, description) VALUES (?,?,?,?,?)",
        [userId, amount, category, date, description],
        (err, result) => {
            if (err) {
                console.error("Error adding expense:", err);
                return res.status(500).json({ message : "Internal server error"});
            }
            res.status(201).json({ message: "Expense added successfully", expenseId: result.insertId });            
        }
    )
}

const updateExpense = (req, res) => {
    const { expenseId, amount, category, date, description } = req.body;
    const userId = req.user.userId;

    connection.query(
        "UPDATE expenses SET amount=?, category=?, date=?, description=? WHERE user_id=? AND id = ?",
        [amount, category, date, description, userId, expenseId],
        (err, result) => {
            if (err) {
                console.error("Error updating expense:", err);
                return res.status(500).json({ message : "Internal server error"});
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Expense not found or unauthorized" });
            }
            res.status(200).json({ message: "Expense updated successfully", expenseId: expenseId });            
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
                return res.status(500).json({ message : "Internal server error"});
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
        "SELECT * FROM expenses WHERE user_id=? AND date BETWEEN ? AND ?",
        [userId, startDate, endDate],
        (err, rows) => {
            if (err) {
                console.error("Error fetching expenses:", err);
                return res.status(500).json({ message : "Internal server error"});
            }
            res.status(200).json({ expenses: rows });
        }
    )
}

module.exports = {
    addnewExpense,
    updateExpense,
    deleteExpense,
    getExpenses
}
