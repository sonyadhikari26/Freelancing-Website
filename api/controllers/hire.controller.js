const createError = require("../utils/createError.js");
const { Order, Gig, User } = require("../models/index.js");

// Create a hire order (without payment processing for now)
const hireService = async (req, res, next) => {
  try {
    const gigId = req.params.id;
    
    // Find the gig
    const gig = await Gig.findByPk(gigId);
    if (!gig) {
      return next(createError(404, "Gig not found!"));
    }

    // Check if user is trying to hire their own service
    if (gig.userId === req.userId) {
      return next(createError(400, "You cannot hire your own service!"));
    }

    // Check if user has already hired this service (optional)
    const existingOrder = await Order.findOne({
      where: {
        gigId: gigId,
        buyerId: req.userId,
        isCompleted: true
      }
    });

    if (existingOrder) {
      return next(createError(400, "You have already hired this service!"));
    }

    // Create the order
    const newOrder = await Order.create({
      id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      gigId: gig.id,
      img: gig.cover,
      title: gig.title,
      buyerId: req.userId,
      sellerId: gig.userId,
      price: gig.price,
      isCompleted: true, // Setting to true for direct hire
      payment_intent: `hire_${Date.now()}`
    });

    // Update gig sales count
    await Gig.update(
      { sales: gig.sales + 1 },
      { where: { id: gigId } }
    );

    res.status(201).json({
      success: true,
      message: "Service hired successfully!",
      order: newOrder
    });
  } catch (err) {
    next(err);
  }
};

// Get orders for the current user (buyer perspective)
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.findAll({
      where: {
        buyerId: req.userId,
        isCompleted: true,
      },
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'username', 'img', 'email']
        },
        {
          model: Gig,
          as: 'gig',
          attributes: ['id', 'title', 'cover', 'price']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json(orders);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  hireService,
  getMyOrders,
};
