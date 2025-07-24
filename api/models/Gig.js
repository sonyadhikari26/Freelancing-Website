const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Gig = sequelize.define('Gig', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  desc: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  totalStars: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  starNumber: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  cat: {
    type: DataTypes.STRING,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  cover: {
    type: DataTypes.STRING,
    allowNull: false
  },
  images: {
    type: DataTypes.TEXT, // JSON string for array of images
    allowNull: true,
    get() {
      const value = this.getDataValue('images');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('images', JSON.stringify(value || []));
    }
  },
  shortTitle: {
    type: DataTypes.STRING,
    allowNull: false
  },
  shortDesc: {
    type: DataTypes.STRING,
    allowNull: false
  },
  deliveryTime: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  revisionNumber: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  features: {
    type: DataTypes.TEXT, // JSON string for array of features
    allowNull: true,
    get() {
      const value = this.getDataValue('features');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('features', JSON.stringify(value || []));
    }
  },
  sales: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'gigs',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

module.exports = Gig;
