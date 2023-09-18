require("dotenv").config({ path: "../.env" });
const Users = require("./Users");

module.exports = (sequelize, DataTypes) => {
  const Counts = sequelize.define(
    "Counts",
    {
      counts: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0, // Set the default value to 0
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      schema: process.env.DATABASE_SCHEMA,
      timestamps: true,
    },
  );
  Counts.associate = (models) => {
    Counts.belongsTo(models.Users, {
      foreignKey: "id", // Use the correct foreign key field in Users model
    });
  };
  return Counts;
};
