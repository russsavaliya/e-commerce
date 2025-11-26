const mongoose = require("mongoose");

const MarketingSpendSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "product"
  },
  date: String,  //for month and year 1/2024
  description: String,
  amount: String,
});

const MarketingSpend = mongoose.model(
  "marketing_spend",
  MarketingSpendSchema
);

module.exports = MarketingSpend;
