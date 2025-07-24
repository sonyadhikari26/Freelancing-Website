import createError from "../utils/createError.js";
import { prisma } from "../config/database.js";

export const createConversation = async (req, res, next) => {
  try {
    // Extract user IDs from the request
    const sellerId = req.body.sellerId;
    const buyerId = req.body.buyerId;

    // Generate a unique conversation ID based on the lexicographical order of IDs
    const conversationId = sellerId < buyerId ? sellerId + buyerId : buyerId + sellerId;

    // Check if conversation already exists
    const existingConversation = await prisma.conversation.findUnique({
      where: { conversationId }
    });

    if (existingConversation) {
      return res.status(200).json(existingConversation);
    }

    // Create a new conversation
    const newConversation = await prisma.conversation.create({
      data: {
        conversationId,
        sellerId,
        buyerId,
        readBySeller: req.isSeller, // Set read status based on current user's role
        readByBuyer: !req.isSeller, // Opposite of readBySeller
      }
    });

    res.status(201).send(newConversation);
  } catch (err) {
    next(err);
  }
};

export const updateConversation = async (req, res, next) => {
  try {
    const updateData = req.isSeller 
      ? { readBySeller: true } 
      : { readByBuyer: true };

    const updatedConversation = await prisma.conversation.update({
      where: { 
        conversationId: req.params.id 
      },
      data: updateData
    });

    res.status(200).send(updatedConversation);
  } catch (err) {
    next(err);
  }
};

export const getSingleConversation = async (req, res, next) => {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { 
        conversationId: req.params.id 
      },
      include: {
        buyer: {
          select: {
            id: true,
            username: true,
            img: true,
          }
        },
        seller: {
          select: {
            id: true,
            username: true,
            img: true,
          }
        }
      }
    });

    if (!conversation) return next(createError(404, "Conversation not found!"));
    res.status(200).send(conversation);
  } catch (err) {
    next(err);
  }
};

export const getConversations = async (req, res, next) => {
  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { sellerId: req.userId }, // Check if the user is the seller
          { buyerId: req.userId }, // Check if the user is the buyer
        ],
      },
      orderBy: {
        updatedAt: 'desc'
      },
      include: {
        buyer: {
          select: {
            id: true,
            username: true,
            img: true,
          }
        },
        seller: {
          select: {
            id: true,
            username: true,
            img: true,
          }
        }
      }
    });

    res.status(200).send(conversations);
  } catch (err) {
    next(err);
  }
};
