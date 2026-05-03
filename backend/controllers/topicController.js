const Topic = require('../models/Topic');

// @desc Update a topic
// @route PUT /api/topics/:id
const updateTopic = async (req, res) => {
  const topic = await Topic.findById(req.params.id);
  if (!topic) return res.status(404).json({ message: 'Topic not found' });

  const { title, summary, difficulty } = req.body;
  if (title) topic.title = title;
  if (summary) topic.summary = summary;
  if (difficulty) topic.difficulty = difficulty;

  await topic.save();
  res.json(topic);
};

// @desc Delete a topic
// @route DELETE /api/topics/:id
const deleteTopic = async (req, res) => {
  const topic = await Topic.findById(req.params.id);
  if (!topic) return res.status(404).json({ message: 'Topic not found' });
  await topic.deleteOne();
  res.json({ message: 'Topic removed' });
};

// @desc Get a single topic
// @route GET /api/topics/:id
const getTopic = async (req, res) => {
  const topic = await Topic.findById(req.params.id);
  if (!topic) return res.status(404).json({ message: 'Topic not found' });
  res.json(topic);
};

module.exports = { updateTopic, deleteTopic, getTopic };
