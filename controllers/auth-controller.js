const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const getConnection = require("../db/database");
const connection = getConnection();

const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    connection.query(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashedPassword],
      (err, results) => {
        if (err) {
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: "Email or username already exists" });
          }
          console.error("Error registering user:", err);
          return res.status(500).json({ message: "Internal server error" });
        }
        res.status(201).json({ message: "User registered successfully" });
      }
    );
  } catch (err) {
    console.error("Internal registration error123:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const loginUser = (req, res) => {
  const { email, password } = req.body;
  
  connection.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, rows) => {
      if (err) {
        console.error("Login error:", err);
        return res.status(500).json({ message: "Internal server error" });
      }
      
      if (rows.length === 0) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const user = rows[0];
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const token = jwt.sign(
        { userId: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn : "24h" }
      );
      
      res.json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      });
    }
  );
};

module.exports = {
    registerUser,
    loginUser
}
