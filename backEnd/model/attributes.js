const mongoose = require('mongoose');

const attributesSchema = new mongoose.Schema({
  name: { type: String, required: true },
  values: [
    {
      value: { type: String, required: true }
    }
  ]

});

const Attributes = mongoose.model("attributes", attributesSchema);

module.exports = Attributes;
