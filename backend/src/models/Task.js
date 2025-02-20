const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  name: { type: String, required: true },
  description: { type: String, required: true },
  timeUntilFinish: { type: Number, required: true },
  status: { type: String, required: true },
  category: { type: String, required: true },
});

module.exports = mongoose.model("Task", TaskSchema);
