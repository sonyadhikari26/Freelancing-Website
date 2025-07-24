const sequelize = require('../database');
const User = require('./User');
const Gig = require('./Gig');
const Order = require('./Order');
const Conversation = require('./Conversation');
const Message = require('./Message');
const Review = require('./Review');

// User associations
User.hasMany(Gig, { foreignKey: 'userId', as: 'gigs' });
User.hasMany(Order, { foreignKey: 'sellerId', as: 'soldOrders' });
User.hasMany(Order, { foreignKey: 'buyerId', as: 'boughtOrders' });
User.hasMany(Conversation, { foreignKey: 'sellerId', as: 'sellerConversations' });
User.hasMany(Conversation, { foreignKey: 'buyerId', as: 'buyerConversations' });
User.hasMany(Message, { foreignKey: 'userId', as: 'messages' });
User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });

// Gig associations
Gig.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Gig.hasMany(Order, { foreignKey: 'gigId', as: 'orders' });
Gig.hasMany(Review, { foreignKey: 'gigId', as: 'reviews' });

// Order associations
Order.belongsTo(Gig, { foreignKey: 'gigId', as: 'gig' });
Order.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });
Order.belongsTo(User, { foreignKey: 'buyerId', as: 'buyer' });

// Conversation associations
Conversation.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });
Conversation.belongsTo(User, { foreignKey: 'buyerId', as: 'buyer' });
Conversation.hasMany(Message, { foreignKey: 'conversationId', as: 'messages' });

// Message associations
Message.belongsTo(Conversation, { foreignKey: 'conversationId', as: 'conversation' });
Message.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Review associations
Review.belongsTo(Gig, { foreignKey: 'gigId', as: 'gig' });
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  sequelize,
  User,
  Gig,
  Order,
  Conversation,
  Message,
  Review
};
