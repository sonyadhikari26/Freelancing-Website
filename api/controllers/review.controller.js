import createError from "../utils/createError.js";
import { prisma } from "../config/database.js";

export const createReview = async (req, res, next) => {
  try {
    const { gigId, desc, star } = req.body;
    const userId = req.userId;

    // Validate star rating
    if (!star || star < 1 || star > 5) {
      return next(createError(400, "Star rating must be between 1 and 5"));
    }

    // Check if the user has already created a review for this gig
    const existingReview = await prisma.review.findFirst({
      where: { 
        gigId, 
        userId 
      }
    });

    if (existingReview) {
      return next(
        createError(403, "You have already created a review for this gig!")
      );
    }

    // Check if the user has purchased and completed the gig
    const userHasPurchased = await prisma.order.findFirst({
      where: {
        gigId,
        buyerId: userId,
        isCompleted: true,
      }
    });

    if (!userHasPurchased) {
      return next(
        createError(403, "You must purchase and complete the gig before reviewing it!")
      );
    }

    // Create the review
    const savedReview = await prisma.review.create({
      data: {
        userId,
        gigId,
        desc,
        star: parseInt(star),
      },
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
    });

    // Update gig stats
    await prisma.gig.update({
      where: { id: gigId },
      data: {
        totalStars: {
          increment: parseInt(star)
        },
        starNumber: {
          increment: 1
        }
      }
    });

    res.status(201).send(savedReview);
  } catch (err) {
    next(err);
  }
};

export const getReviews = async (req, res, next) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { 
        gigId: req.params.gigId 
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            img: true,
            country: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).send(reviews);
  } catch (err) {
    next(err);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const review = await prisma.review.findUnique({
      where: { id: req.params.id }
    });

    if (!review) {
      return next(createError(404, "Review not found"));
    }

    // Check if user owns this review
    if (review.userId !== req.userId) {
      return next(createError(403, "You can only delete your own reviews"));
    }

    // Delete the review and update gig stats
    await prisma.$transaction(async (tx) => {
      await tx.review.delete({
        where: { id: req.params.id }
      });

      await tx.gig.update({
        where: { id: review.gigId },
        data: {
          totalStars: {
            decrement: review.star
          },
          starNumber: {
            decrement: 1
          }
        }
      });
    });

    res.status(200).send("Review deleted successfully");
  } catch (err) {
    next(err);
  }
};
