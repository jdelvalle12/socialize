// const { ObjectId } = require('mongoose').Types;
const { User, Thought } = require('../models');


// Aggregate function to get the number of users overall
const friendCount = async () =>
  User.aggregate()
    .count('friendCount')
    .then((numberOfFriends) => numberOfFriends);

// Aggregate function for getting the overall friend count using $avg
// const friends = async (friend_id) =>
//   User.aggregate([
//     // only include the given user by using $match
//     { $match: { _id: ObjectId(friend_id) } },
//     {
//       // $unwind: '$friends',
//     },
//     {
//       $group: {
//         userId: ObjectId(friend_id),
//         friendCount: { $avg: { $size:'$friends'} },
//       },
//     },
  // ]);

module.exports = {
  // Get all users
  getUsers(req, res) {
    User.find()
    .populate('thoughts')
      .then(async (users) => {
        const userObj = {
          users
      //     friendCount: await friendCount(),
      // //   };
      // //   Add reaction count for each thought in each user's thoughts array
      // // for (const user of userObj.users) {
      // //   for (const thought of user.thoughts) {
      // //     thought.reactionCount = await getReactionCount(thought._id);
      // //   }
      }
        return res.json(userObj);
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).json(err);
      });
  },
  // Get a single user
  getSingleUser(req, res) {
    console.log(req.params.userId);
    console.log(req.params);
    User.findOne({ _id: req.params.userId })
      .select('-__v')
      .populate('friends')
      .populate('thoughts')
      .then(async (user) =>
        !user
          ? res.status(404).json({ message: 'No user with that ID' })
          : res.json({ user })
      )
      .catch((err) => {
        console.log(err);
        return res.status(500).json(err);
      });
  },
  // create a new user
  createUser(req, res) {
    User.create(req.body)
      .then((user) => res.json(user))
      .catch((err) => res.status(500).json(err));
  },
  // Update a user 
  updateUser(req, res) {
    User.findOneAndUpdate(
      { _id: req.params.userId },
      { $set: req.body },
      { runValidators: true, new: true }
    )
      .then((user) =>
        !user
          ? res.status(404).json({ message: 'No thought with this id!' })
          : res.json(user)
      )
      .catch((err) => res.status(500).json(err));
  },
  // Delete a user and remove them 
  deleteUser(req, res) {
    const deletedUserId = req.params.userId;
    User.findOneAndRemove({ _id: deletedUserId })
      .then((user) =>
        !user
          ? res.status(404).json({ message: 'No such user exists' })
          : User.findOneAndUpdate(
              { userId: req.params.userId },
              { $pull: { users: req.params.userId } },
              { new: true }
            )
      )
      .then((user) =>
        !user
          ? res.status(404).json({
              message: 'user deleted, no users found',
            })
          : res.json({ message: 'user successfully deleted' })
      )
      .catch((err) => {
        console.log(err);
        res.status(500).json(err);
      });
  },

  // Add a friend to a user
  addFriend(req, res) {
    console.log('You are adding a friend');
    console.log('-----------',req.params );
    
    User.findOneAndUpdate(
      { userId: req.params.userId },
      { $addToSet: { friends: req.params.userId } },
      { runValidators: true, new: true }
    )
      .then((user) =>
        !user
          ? res
              .status(404)
              .json({ message: 'No user found with that ID :(' })
          : res.json(user)
      )
      .catch((err) => res.status(500).json(err));
  },
  // Remove a friend from a user
  removeFriend(req, res) {
    User.findOneAndUpdate({ userId: req.params.userId },
      { $pull: {friends: req.params.userId} },
      {new: true}
      )
      .then((user) =>
        !user
          ? res
              .status(404)
              .json({ message: 'User not found :(' })
          : res.json(user)
      )
      .catch((err) => res.status(500).json(err));
  },
};
