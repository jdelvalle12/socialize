const mongoose = require('mongoose');
const { Schema, model } = require('mongoose');

const userSchema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [
        /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/ // regular expression to validate email format
      ],
    },
    thoughts: [{ 
      type: Schema.Types.ObjectId, 
      ref: 'Thought' 
    }],
    friends: [
      { 
      type: Schema.Types.ObjectId, 
      ref: 'User',
    }],
  }, 
  { toJSON: { virtuals: true }, id: false });

// virtual to get the length of the user's friends array field on query
userSchema.virtual('friendCount').get(function () {
  return this.friends.length;
});

const User = model('User', userSchema);

module.exports = User;