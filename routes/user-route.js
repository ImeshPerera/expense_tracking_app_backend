const express = require('express');
const router = express.Router();
const upload = require("../middleware/multer-middleware");
const auth = require("../middleware/auth-middleware");
const validate = require("../middleware/validation-middleware");
const { 
  expenseSchema, 
  updateExpenseSchema, 
  deleteExpenseSchema, 
  getExpensesSchema 
} = require("../validators/expense-validator");

const { addnewExpense, updateExpense, deleteExpense, getExpenses } = require('../controllers/process-controller');

router.post("/", auth, validate(expenseSchema), addnewExpense);
router.put("/", auth, validate(updateExpenseSchema), updateExpense);
router.delete("/", auth, validate(deleteExpenseSchema), deleteExpense);
router.get("/", auth, validate(getExpensesSchema), getExpenses);

module.exports = router;