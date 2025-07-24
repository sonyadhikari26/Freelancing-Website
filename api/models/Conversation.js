const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Conversation = sequelize.define('Conversation', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  sellerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  buyerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  readBySeller: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  readByBuyer: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  lastMessage: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'conversations',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

module.exports = Conversation;
