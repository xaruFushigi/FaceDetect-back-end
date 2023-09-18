require("dotenv").config({ path: "../.env" });
const Counts = require("./Counts");

module.exports = (sequelize, DataTypes) => {
  const Users = sequelize.define(
    "Users",
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      schema: process.env.DATABASE_SCHEMA,
      timestamps: true,
    },
  );

  Users.associate = (models) => {
    Users.hasMany(models.Counts, {
      foreignKey: "userId", // Use the correct foreign key field in Counts model
      onDelete: "CASCADE", // Cascade deletion when a user is deleted
    });
  };

  return Users;
};
