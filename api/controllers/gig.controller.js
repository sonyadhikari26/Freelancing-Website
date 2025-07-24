const { Gig, User, Review } = require("../models/index.js");
const createError = require("../utils/createError.js");
const { Op } = require("sequelize");

const createGig = async (req, res, next) => {
  if (!req.isSeller) {
    return next(createError(403, "Only sellers can create a gig!"));
  }

  try {
    console.log("Current User ID:", req.userId);

    const gigData = {
      userId: req.userId,
      title: req.body.title,
      desc: req.body.desc,
      totalStars: req.body.totalStars || 0,
      starNumber: req.body.starNumber || 0,
      cat: req.body.cat,
      price: parseFloat(req.body.price),
      cover: req.body.cover,
      images: req.body.images || [],
      shortTitle: req.body.shortTitle,
      shortDesc: req.body.shortDesc,
      deliveryTime: parseInt(req.body.deliveryTime),
      revisionNumber: req.body.revisionNumber ? parseInt(req.body.revisionNumber) : 0,
      features: req.body.features || [],
      sales: req.body.sales || 0,
    };

    const savedGig = await Gig.create(gigData);
    const gigWithUser = await Gig.findByPk(savedGig.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'img', 'isSeller']
      }]
    });

    res.status(201).json(gigWithUser);
  } catch (err) {
    console.error("Error creating gig:", err);
    next(err);
  }
};

const deleteGig = async (req, res, next) => {
  try {
    const gig = await Gig.findByPk(req.params.id);

    if (!gig) {
      return next(createError(404, "Gig not found!"));
    }

    if (gig.userId !== req.userId) {
      return next(createError(403, "You can delete only your gig!"));
    }

    await gig.destroy();

    res.status(200).send("Gig has been deleted!");
  } catch (err) {
    next(err);
  }
};

const getGig = async (req, res, next) => {
  try {
    const gig = await Gig.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'img', 'country', 'desc', 'isSeller', 'createdAt']
        },
        {
          model: Review,
          as: 'reviews',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'img', 'country']
          }]
        }
      ]
    });

    if (!gig) return next(createError(404, "Gig not found!"));

    res.status(200).json(gig);
  } catch (err) {
    next(err);
  }
};

const getGigs = async (req, res, next) => {
  const q = req.query;

  try {
    const where = {};

    // User filter
    if (q.userId) {
      where.userId = q.userId;
    }

    // Category filter
    if (q.cat) {
      where.cat = q.cat;
    }

    // Price range filter
    if (q.min || q.max) {
      where.price = {};
      if (q.min) where.price[Op.gte] = parseFloat(q.min);
      if (q.max) where.price[Op.lte] = parseFloat(q.max);
    }

    // Delivery time filter
    if (q.delivery) {
      where.deliveryTime = { [Op.lte]: parseInt(q.delivery) };
    }

    // Search filter
    if (q.search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${q.search}%` } },
        { desc: { [Op.iLike]: `%${q.search}%` } },
        { shortTitle: { [Op.iLike]: `%${q.search}%` } },
        { shortDesc: { [Op.iLike]: `%${q.search}%` } }
      ];
    }

    // Sorting
    let order = [['createdAt', 'DESC']]; // Default sort by newest
    if (q.sort === 'price') {
      order = [['price', 'ASC']];
    } else if (q.sort === '-price') {
      order = [['price', 'DESC']];
    } else if (q.sort === 'sales') {
      order = [['sales', 'DESC']];
    } else if (q.sort === 'starNumber') {
      order = [['starNumber', 'DESC']];
    } else if (q.sort === 'totalStars') {
      order = [['totalStars', 'DESC']];
    } else if (q.sort === 'createdAt') {
      order = [['createdAt', 'DESC']];
    }

    const gigs = await Gig.findAll({
      where,
      order,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'img', 'isSeller', 'country']
      }]
    });

    res.status(200).json(gigs);
  } catch (err) {
    console.error("Error fetching gigs:", err);
    next(err);
  }
};

module.exports = {
  createGig,
  deleteGig,
  getGig,
  getGigs
};
