const { DataTypes, Model } = require("sequelize");
const bcrypt = require("bcrypt");

module.exports = (sequelize) => {
  class User extends Model {}
  User.init(
    {
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Your first name is required.",
          },
          notEmpty: {
            msg: "Please provide your first name.",
          },
        },
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Your last name is required.",
          },
          notEmpty: {
            msg: "Please provide your last name.",
          },
        },
      },
      emailAddress: {
        type: DataTypes.STRING,
        unique: {
          msg: "Email address is already taken. Please provide another one.",
        },
        allowNull: false,
        validate: {
          isEmail: {
            msg: "Please use the correct email format: example@email.com",
          },
          notNull: {
            msg: "Please provide your email address.",
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Your password must be at least 8 to 20 characters in length",
          },
          notEmpty: {
            msg: "Your password must be at least 8 to 20 characters in length.",
          },
        },
        set(val) {
          if (val.length >= 8 && val.length <= 20) {
            const hashedPassword = bcrypt.hashSync(val, 10);
            this.setDataValue("password", hashedPassword);
          }
        },
      },
    },
    { sequelize }
  );

  User.associate = (models) => {
    User.hasMany(models.Course, {
      as: "user",
      foreignKey: {
        fieldName: "userId",
        allowNull: false,
        validate: {
          notNull: {
            msg: "Please provide a user's ID to userId.",
          },
        },
      },
    });
  };

  return User;
};
