const createError = require("../utils/createError.js");
const { Order, Gig, User } = require("../models/index.js");

// Create a direct order (without payment processing)
const createOrder = async (req, res, next) => {
  try {
    const gigId = req.params.id;
    
    const gig = await Gig.findByPk(gigId);
    if (!gig) {
      return next(createError(404, "Gig not found!"));
    }

    // Check if user is trying to hire their own service
    if (gig.userId === req.userId) {
      return next(createError(400, "You cannot hire your own service!"));
    }

    // Create the order directly
    const newOrder = await Order.create({
      id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      gigId: gig.id,
      img: gig.cover,
      title: gig.title,
      buyerId: req.userId,
      sellerId: gig.userId,
      price: gig.price,
      isCompleted: true, // Direct completion since no payment processing
      payment_intent: `direct_${Date.now()}`
    });

    // Update gig sales count
    await Gig.update(
      { sales: gig.sales + 1 },
      { where: { id: gigId } }
    );

    res.status(201).json({
      success: true,
      message: "Order created successfully!",
      order: newOrder
    });
  } catch (err) {
    next(err);
  };
};

// Get the orders the user has placed (My Orders)
const getMyOrders = async (req, res, next) => {
  try {
    const myOrders = await Order.findAll({
      where: {
        buyerId: req.userId,
        isCompleted: true,
      },
      include: [
        {
          model: User,
          as: 'buyer',
          attributes: ['id', 'username', 'img']
        },
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'username', 'img']
        },
        {
          model: Gig,
          as: 'gig',
          attributes: ['id', 'title', 'cover', 'price']
        }
      ]
    });

    res.status(200).send(myOrders);
  } catch (err) {
    next(err);
  }
};

// Get the orders the user has received (Received Orders for Sellers)
const getReceivedOrders = async (req, res, next) => {
  try {
    // Ensure the user is a seller
    if (!req.isSeller) {
      return next(
        createError(403, "You are not authorized to view received orders.")
      );
    }

    const receivedOrders = await Order.findAll({
      where: {
        sellerId: req.userId,
        isCompleted: true,
      },
      include: [
        {
          model: User,
          as: 'buyer',
          attributes: ['id', 'username', 'img']
        },
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'username', 'img']
        },
        {
          model: Gig,
          as: 'gig',
          attributes: ['id', 'title', 'cover', 'price']
        }
      ]
    });

    res.status(200).send(receivedOrders);
  } catch (err) {
    next(err);
  }
};

// Confirm the order (simplified without Stripe)
const confirm = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    
    const order = await Order.findByPk(orderId);
    if (!order) {
      return next(createError(404, "Order not found"));
    }

    await Order.update(
      { isCompleted: true },
      { where: { id: orderId } }
    );

    res.status(200).send("Order has been confirmed.");
  } catch (err) {
    next(err);
  }
};

// Update the status of an order (e.g., from "PENDING" to "COMPLETED")
const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate the provided status
    if (!["PENDING", "COMPLETED"].includes(status)) {
      return next(createError(400, "Invalid status value"));
    }

    // Find the order by ID
    const order = await Order.findByPk(id);

    if (!order) {
      return next(createError(404, "Order not found"));
    }

    console.log(order.sellerId, req.userId);

    // Ensure the seller is authorized to update the status
    if (req.isSeller && order.sellerId !== req.userId) {
      return next(
        createError(403, "You are not authorized to update this order")
      );
    }

    // Update the order status
    await Order.update(
      { isCompleted: status === 'COMPLETED' },
      { where: { id } }
    );

    res.status(200).send("Order status updated successfully");
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getReceivedOrders,
  confirm,
  updateOrderStatus,
};
