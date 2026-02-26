const Joi = require('joi');

const expenseSchema = Joi.object({
  amount: Joi.number().positive().required(),
  categoryId: Joi.number().integer().positive().required(),
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
  start: Joi.date().iso().optional(),
  end: Joi.date().iso().min(Joi.ref('start')).optional(),
  limit: Joi.number().integer().min(1).default(20),
  offset: Joi.number().integer().min(0).default(0),
  search: Joi.string().allow('').optional()
});

const statsSchema = Joi.object({
  start: Joi.date().iso().optional(),
  end: Joi.date().iso().min(Joi.ref('start')).optional(),
  period: Joi.string().valid('day', 'week', 'month', 'year').default('day').optional()
});

module.exports = {
  expenseSchema,
  updateExpenseSchema,
  deleteExpenseSchema,
  getExpensesSchema,
  statsSchema
};
