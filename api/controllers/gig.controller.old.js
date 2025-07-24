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

    if (q.userId) {
      where.userId = q.userId;
    }

    if (q.cat) {
      where.cat = q.cat;
    }

    if (q.min || q.max) {
      where.price = {};
      if (q.min) where.price[Op.gte] = parseFloat(q.min);
      if (q.max) where.price[Op.lte] = parseFloat(q.max);
    }

    if (q.search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${q.search}%` } },
        { desc: { [Op.iLike]: `%${q.search}%` } }
      ];
    }

    let order = [['createdAt', 'DESC']];
    if (q.sort === 'price') {
      order = [['price', 'ASC']];
    } else if (q.sort === '-price') {
      order = [['price', 'DESC']];
    } else if (q.sort === 'sales') {
      order = [['sales', 'DESC']];
    }

    const gigs = await Gig.findAll({
      where,
      order,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'img', 'isSeller']
      }]
    });

    res.status(200).json(gigs);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createGig,
  deleteGig,
  getGig,
  getGigs
};

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
      price: parseInt(req.body.price),
      cover: req.body.cover,
      images: req.body.images || [],
      shortTitle: req.body.shortTitle,
      shortDesc: req.body.shortDesc,
      deliveryTime: parseInt(req.body.deliveryTime),
      revisionNumber: req.body.revisionNumber ? parseInt(req.body.revisionNumber) : null,
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

export const getGig = async (req, res, next) => {
  try {
    // Fetch the main gig by ID with user information
    const gig = await prisma.gig.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            img: true,
            country: true,
            desc: true,
            isSeller: true,
            createdAt: true,
          }
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                img: true,
                country: true,
              }
            }
          }
        }
      }
    });

    if (!gig) return next(createError(404, "Gig not found!"));

    // Get all gigs for recommendation system
    const allGigs = await prisma.gig.findMany({
      select: {
        id: true,
        title: true,
        desc: true,
        cat: true,
        price: true,
        totalStars: true,
        starNumber: true,
      }
    });

    // Convert gig data for recommendation system (maintain compatibility)
    const gigForRecommendation = {
      _id: gig.id,
      title: gig.title,
      desc: gig.desc,
      cat: gig.cat.toLowerCase().replace(/_/g, '_'),
      price: gig.price,
      totalStars: gig.totalStars,
      starNumber: gig.starNumber,
    };

    const allGigsFormatted = allGigs.map(g => ({
      _id: g.id,
      title: g.title,
      desc: g.desc,
      cat: g.cat.toLowerCase().replace(/_/g, '_'),
      price: g.price,
      totalStars: g.totalStars,
      starNumber: g.starNumber,
    }));

    // Get recommended gigs
    const recommendedGigs = recommendSimilarGigs(gig.id, allGigsFormatted);

    // Fetch full recommended gig details
    const recommendedGigIds = recommendedGigs.map(rec => rec.id);
    const recommendedGigList = await prisma.gig.findMany({
      where: {
        id: { in: recommendedGigIds }
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            img: true,
          }
        }
      }
    });

    // Sort by recommendation score
    const recommendedGigMap = recommendedGigList.reduce((acc, gig) => {
      acc[gig.id] = gig;
      return acc;
    }, {});

    const sortedRecommendedGigs = recommendedGigs
      .map(rec => recommendedGigMap[rec.id])
      .filter(gig => gig);

    res.status(200).json({
      gig,
      recommendedGigs: sortedRecommendedGigs,
    });
  } catch (err) {
    next(err);
  }
};

export const getGigs = async (req, res, next) => {
  const q = req.query;

  try {
    // Build where clause for filtering
    const where = {};

    if (q.userId) {
      where.userId = q.userId;
    }

    if (q.cat) {
      where.cat = mapCategoryToEnum(q.cat);
    }

    if (q.min || q.max) {
      where.price = {};
      if (q.min) where.price.gte = parseInt(q.min);
      if (q.max) where.price.lte = parseInt(q.max);
    }

    if (q.search) {
      where.OR = [
        {
          title: {
            contains: q.search,
            mode: 'insensitive'
          }
        },
        {
          desc: {
            contains: q.search,
            mode: 'insensitive'
          }
        }
      ];
    }

    // Build orderBy clause
    let orderBy = { createdAt: 'desc' };
    if (q.sort === 'price') {
      orderBy = { price: 'asc' };
    } else if (q.sort === '-price') {
      orderBy = { price: 'desc' };
    } else if (q.sort === 'sales') {
      orderBy = { sales: 'desc' };
    }

    const gigs = await prisma.gig.findMany({
      where,
      orderBy,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            img: true,
            isSeller: true,
          }
        }
      }
    });

    res.status(200).json(gigs);
  } catch (err) {
    next(err);
  }
};
