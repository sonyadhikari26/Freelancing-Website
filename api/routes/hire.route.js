const express = require("express");
const { verifyToken } = require("../middleware/jwt.js");
const {
  hireService,
  getMyOrders,
} = require("../controllers/hire.controller.js");

const router = express.Router();

// Route for hiring a service
router.post("/hire/:id", verifyToken, hireService);

// Route for getting user's hired services (orders)
router.get("/my-orders", verifyToken, getMyOrders);

module.exports = router;
