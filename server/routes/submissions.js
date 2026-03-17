const express = require('express');
const Question = require('../models/Question');
const Submission = require('../models/Submission');
const Quiz = require('../models/Quiz');
const { protect, studentOnly, teacherOnly } = require('../middleware/auth');

const router = express.Router();

// POST answers for a specific quiz
router.post('/:id/submit', protect, studentOnly, async (req, res) => {
  try {
    const { answers } = req.body;
    const quizId = req.params.id;

    const questions = await Question.find({ quizId });
    let score = 0;

    questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        score++;
      }
    });

    const submission = await Submission.create({
      studentId: req.user._id,
      quizId,
      score,
      totalQuestions: questions.length
    });

    res.json({
      submission,
      score,
      totalQuestions: questions.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET all results for a quiz (Teacher only)
router.get('/:id/results', protect, teacherOnly, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    if (quiz.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view results' });
    }

    const submissions = await Submission.find({ quizId: req.params.id })
      .populate('studentId', 'name email')
      .sort({ submittedAt: -1 });

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
