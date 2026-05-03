const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  generateQuiz, createQuiz, getQuizzesByModule,
  getQuiz, updateQuiz, publishQuiz,
} = require('../controllers/quizController');

router.use(protect);
router.get('/module/:moduleId', getQuizzesByModule);
router.get('/:id', getQuiz);
router.post('/', authorize('faculty', 'admin'), createQuiz);
router.post('/generate/:moduleId', authorize('faculty', 'admin'), generateQuiz);
router.put('/:id', authorize('faculty', 'admin'), updateQuiz);
router.put('/:id/publish', authorize('faculty', 'admin'), publishQuiz);

module.exports = router;
