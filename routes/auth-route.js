const express = require('express');
const router = express.Router();
const auth = require("../middleware/auth-middleware");
const validate = require("../middleware/validation-middleware");
const { registerSchema, loginSchema } = require("../validators/auth-validator");

const { registerUser, loginUser } = require('../controllers/auth-controller');

router.post("/register", validate(registerSchema), registerUser);
router.post("/login", validate(loginSchema), loginUser);

module.exports = router;