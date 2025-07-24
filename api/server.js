const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const userRoute = require("./routes/user.route.js");
const gigRoute = require("./routes/gig.route.js");
const hireRoute = require("./routes/hire.route.js");
// const orderRoute = require("./routes/order.route.js");
// const conversationRoute = require("./routes/conversation.route.js");
// const messageRoute = require("./routes/message.route.js");
// const reviewRoute = require("./routes/review.route.js");
const authRoute = require("./routes/auth.route.js");
const uploadRoute = require("./routes/upload.route.js");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const sequelize = require("./database.js");

const app = express();
dotenv.config();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/gigs", gigRoute);
app.use("/api/upload", uploadRoute);
app.use("/api/hire", hireRoute);
// app.use("/api/orders", orderRoute);
// app.use("/api/conversations", conversationRoute);
// app.use("/api/messages", messageRoute);
// app.use("/api/reviews", reviewRoute);

app.use((err, req, res, next) => {
  const errorStatus = err.status || 500;
  const errorMessage = err.message || "Something went wrong!";

  return res.status(errorStatus).send(errorMessage);
});

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully!');
    
    app.listen(8800, () => {
      console.log("Backend server is running on port 8800!");
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

startServer();
