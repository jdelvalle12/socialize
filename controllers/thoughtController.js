const { User, Thought, Reaction } = require('../models');

// Aggregate function to get the number of reactions overall
const getReactionCount = async (thought_id) => {
  const reactionCount = await Thought.aggregate([
    { $match: { thought_id: thought_id } },
    { $project: { reactionCount: { $size: '$reaction' } } },
  ]);

  return reactionCount[0].reactionCount;
};

module.exports = {
  // Get all thoughts
  getThoughts(req, res) {
    Thought.find()
      .then((thoughts) => res.json(thoughts))
      .catch((err) => res.status(500).json(err));
  },
  // Get a thought
  getSingleThought(req, res) {
    Thought.findOne({ thought_id: req.params.thought_id })
      .select('-__v')
      .populate('reactions')
      .then((thought) =>
        !thought
          ? res.status(404).json({ message: 'No thought with that ID' })
          : res.json(thought)
      )
      .catch((err) => res.status(500).json(err));
  },
  // Create a thought
  createThought(req, res) {
    Thought.create(req.body)
      .then((thought) => {
        User.findOneAndUpdate(
          { username: req.body.username},
          { $addToSet: {thoughts: thought._id}}
        )
        .then((userData) =>{
          if(!userData) {
            res.status(404).send('username does not exist');
          } else {
            console.log(userData);
          res.json(thought);
          }
        });
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).json(err);
      });
  },
  // Delete a thought
  deleteThought(req, res) {
    Thought.findOneAndDelete({ thought_id: req.params.thought_id })
      .then((thought) =>
        !thought
          ? res.status(404).json({ message: 'No thought with that ID' })
          : Thought.deleteMany({ thought_id: { $in: thought.users } })
      )
      .then(() => res.json({ message: 'thought and users deleted!' }))
      .catch((err) => res.status(500).json(err));
  },
  // Update a thought
  updateThought(req, res) {
    Thought.findOneAndUpdate(
      { thought_id: req.params.thought_id },
      { $set: req.body },
      { runValidators: true, new: true }
    )
      .then((thought) =>
        !thought
          ? res.status(404).json({ message: 'It s the thought that counts!' })
          : res.json(thought)
      )
      .catch((err) => res.status(500).json(err));
  },

// Create a reaction
createReaction(req, res) {
  req.body.reactionBody = 'some value';
  Reaction.create(req.body)
    .then((newReaction) => {
      Thought.findOneAndUpdate(
        { _id: req.body.thought_id},
        { $addToSet: {reactions: newReaction.reactionId}},
        { new: true, runValidators: true }
      )
      .then((updatedThoughtData) =>{
        if(!updatedThoughtData) {
          return res.status(404).send('Thought ID does not exist');
        } else {
          console.log(updatedThoughtData);
          res.status(201).json(updatedThoughtData);
        }
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).json(err);
      });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json(err);
    });
},
// Update a reaction to a thought
updateReaction(req, res) {
  console.log('You are updating a reaction');
  console.log(req.body);
  Thought.findOneAndUpdate(
    { _id: req.params.thought_id },
    { $addToSet: { reaction: req.body.reaction_id } },
    { runValidators: true, new: true }
  )
    .then((thought) =>
      !thought
        ? res
            .status(404)
            .json({ message: 'No reaction found with that ID :(' })
        : res.json(thought)
    )
    .catch((err) => res.status(500).json(err));
  },
// Remove a reaction from a thought
removeReaction(req, res) {
  Thought.findOneAndUpdate(
    { _id: req.params.thought_id },
    { $pull: { reaction: { reactions: req.params.reaction_id } } },
    { runValidators: true, new: true }
  )
    .then((thought) =>
      !thought
        ? res
            .status(404)
            .json({ message: 'No user found with that ID :(' })
        : res.json(thought)
    )
    .catch((err) => res.status(500).json(err));
    }
};
