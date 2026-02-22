const Joi = require('joi');

const expenseSchema = Joi.object({
  amount: Joi.number().positive().required(),
  category: Joi.string().min(3).required(),
  date: Joi.date().iso().required(),
  description: Joi.string().allow('').max(255),
  ref_image: Joi.any().optional()
});

const updateExpenseSchema = expenseSchema.keys({
  expenseId: Joi.number().required(),
  ref_image: Joi.any().optional()
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
