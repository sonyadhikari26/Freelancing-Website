const { User } = require("../models/index.js");
const createError = require("../utils/createError.js");

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return next(createError(404, "User not found!"));
    }

    if (req.userId !== user.id) {
      return next(createError(403, "You can delete only your account!"));
    }

    await user.destroy();

    res.status(200).send("User deleted successfully.");
  } catch (err) {
    next(err);
  }
};

const getUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: [
        'id',
        'username',
        'email',
        'img',
        'country',
        'phone',
        'desc',
        'isSeller',
        'createdAt',
        'updatedAt'
      ]
    });

    if (!user) {
      return next(createError(404, "User not found!"));
    }

    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  deleteUser,
  getUser
};