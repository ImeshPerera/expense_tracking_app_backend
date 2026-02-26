const express = require('express');
const router = express.Router();
const upload = require("../middleware/multer-middleware");
const auth = require("../middleware/auth-middleware");
const validate = require("../middleware/validation-middleware");
const { 
  expenseSchema, 
  updateExpenseSchema, 
  deleteExpenseSchema, 
  getExpensesSchema,
  statsSchema
} = require("../validators/expense-validator");

const { 
  addnewExpense, 
  updateExpense, 
  deleteExpense, 
  getExpenses, 
  getallExpenses,
  getStatsSummary,
  getStatsByCategory,
  getStatsTrend,
  getCategories
} = require('../controllers/process-controller');

router.post("/", auth, upload.single('ref_image'), validate(expenseSchema), addnewExpense);
router.put("/", auth, upload.single('ref_image'), validate(updateExpenseSchema), updateExpense);
router.delete("/", auth, validate(deleteExpenseSchema), deleteExpense);
router.get("/", auth, validate(getExpensesSchema, 'query'), getExpenses);
router.get("/all", auth, getallExpenses);
router.get("/categories", auth, getCategories);
router.get("/stats/summary", auth, validate(statsSchema, 'query'), getStatsSummary);
router.get("/stats/by-category", auth, validate(statsSchema, 'query'), getStatsByCategory);
router.get("/stats/trend", auth, validate(statsSchema, 'query'), getStatsTrend);

module.exports = router;