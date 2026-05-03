const Quiz = require('../models/Quiz');
const Topic = require('../models/Topic');
const Module = require('../models/Module');
const { generateQuizQuestions } = require('../config/aiService');

// @desc Generate quiz from module topics using AI
// @route POST /api/quizzes/generate/:moduleId
const generateQuiz = async (req, res) => {
  const module = await Module.findById(req.params.moduleId).populate('topics');
  if (!module) return res.status(404).json({ message: 'Module not found' });

  const allQuestions = [];
  for (const topic of module.topics) {
    try {
      const questions = await generateQuizQuestions(topic.title, topic.summary, 2);
      questions.forEach((q) => {
        allQuestions.push({ ...q, topicId: topic._id });
      });
    } catch (err) {
      console.error(`Failed to generate questions for topic ${topic.title}:`, err.message);
    }
  }

  if (allQuestions.length === 0) {
    return res.status(500).json({ message: 'AI failed to generate questions' });
  }

  const quiz = await Quiz.create({
    title: `Quiz: ${module.title}`,
    moduleId: module._id,
    questions: allQuestions,
    createdBy: req.user._id,
    status: 'draft',
  });

  res.status(201).json(quiz);
};

// @desc Create quiz manually
// @route POST /api/quizzes
const createQuiz = async (req, res) => {
  const { title, moduleId, questions, timeLimit } = req.body;
  const quiz = await Quiz.create({
    title,
    moduleId,
    questions: questions || [],
    createdBy: req.user._id,
    timeLimit: timeLimit || 30,
  });
  res.status(201).json(quiz);
};

// @desc Get quizzes for a module
// @route GET /api/quizzes/module/:moduleId
const getQuizzesByModule = async (req, res) => {
  const quizzes = await Quiz.find({ moduleId: req.params.moduleId });
  res.json(quizzes);
};

// @desc Get single quiz
// @route GET /api/quizzes/:id
const getQuiz = async (req, res) => {
  const quiz = await Quiz.findById(req.params.id).populate('moduleId', 'title');
  if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

  // Students don't see correct answers
  if (req.user.role === 'student') {
    const sanitized = quiz.toObject();
    sanitized.questions = sanitized.questions.map(({ correctAnswer, ...rest }) => rest);
    return res.json(sanitized);
  }
  res.json(quiz);
};

// @desc Update quiz (add/edit questions)
// @route PUT /api/quizzes/:id
const updateQuiz = async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

  const { title, questions, timeLimit, status } = req.body;
  if (title) quiz.title = title;
  if (questions) quiz.questions = questions;
  if (timeLimit) quiz.timeLimit = timeLimit;
  if (status) quiz.status = status;

  await quiz.save();
  res.json(quiz);
};

// @desc Publish quiz
// @route PUT /api/quizzes/:id/publish
const publishQuiz = async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
  quiz.status = quiz.status === 'published' ? 'draft' : 'published';
  await quiz.save();
  res.json(quiz);
};

module.exports = { generateQuiz, createQuiz, getQuizzesByModule, getQuiz, updateQuiz, publishQuiz };
