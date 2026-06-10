const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Use destructuring to pull the function out, or fallback to the module itself
const passportLocalMongoose = require("passport-local-mongoose");
const plugin = typeof passportLocalMongoose === 'function' 
  ? passportLocalMongoose 
  : (passportLocalMongoose.default || passportLocalMongoose);

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "owner"],
    default: "user",
  }
});

// Use the resolved 'plugin' variable here
userSchema.plugin(plugin);

module.exports = mongoose.model("User", userSchema);
