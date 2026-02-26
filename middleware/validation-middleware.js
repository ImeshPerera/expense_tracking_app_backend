const validate = (schema, source = 'body') => (req, res, next) => {
  const dataToValidate = source === 'query' ? req.query : req.body;
  const { error } = schema.validate(dataToValidate, { abortEarly: false });
  if (error) {
    const errorDetails = error.details.map((detail) => detail.message);
    return res.status(400).json({ errors: errorDetails });
  }
  next();
};

module.exports = validate;
