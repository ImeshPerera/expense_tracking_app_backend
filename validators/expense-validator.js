const Joi = require('joi');

const expenseSchema = Joi.object({
  amount: Joi.number().positive().required(),
  category: Joi.string().min(3).required(),
  date: Joi.date().iso().required(),
  description: Joi.string().allow('').max(255)
});

const updateExpenseSchema = expenseSchema.keys({
  expenseId: Joi.number().required()
});

const deleteExpenseSchema = Joi.object({
  expenseId: Joi.number().required()
});

const getExpensesSchema = Joi.object({
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).required()
});

module.exports = {
  expenseSchema,
  updateExpenseSchema,
  deleteExpenseSchema,
  getExpensesSchema
};
