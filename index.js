const express = require('express');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const processRoutes = require('./routes/user-route');
const authRoutes = require("./routes/auth-route");

app.use(express.urlencoded())
app.use("/uploads", express.static("uploads"));
app.use(express.json())

app.use("/auth", authRoutes);
app.use("/process", processRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});