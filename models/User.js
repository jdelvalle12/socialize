const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
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
    match: /^\S+@\S+\.\S+$/ // regular expression to validate email format
  },
  thoughts: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Thought' 
  }],
  friends: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }]
}, 
{ toJSON: { virtuals: true }, id: false });

// virtual to get the length of the user's friends array field on query
UserSchema.virtual('friendCount').get(function () {
  return this.friends.length;
});

const User = mongoose.model('User', UserSchema);

module.exports = User;