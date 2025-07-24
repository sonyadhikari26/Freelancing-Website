import createError from "../utils/createError.js";
import { prisma } from "../config/database.js";

export const createMessage = async (req, res, next) => {
  try {
    const savedMessage = await prisma.message.create({
      data: {
        conversationId: req.body.conversationId,
        userId: req.userId,
        desc: req.body.desc,
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

    // Update conversation with new message info
    await prisma.conversation.update({
      where: { 
        conversationId: req.body.conversationId 
      },
      data: {
        readBySeller: req.isSeller,
        readByBuyer: !req.isSeller,
        lastMessage: req.body.desc,
        updatedAt: new Date(),
      }
    });

    res.status(201).send(savedMessage);
  } catch (err) {
    next(err);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const messages = await prisma.message.findMany({
      where: { 
        conversationId: req.params.id 
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            img: true,
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
    
    res.status(200).send(messages);
  } catch (err) {
    next(err);
  }
};