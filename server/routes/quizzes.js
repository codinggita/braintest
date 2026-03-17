const express = require('express');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const Submission = require('../models/Submission');
const { protect, teacherOnly, studentOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const quizzes = await Quiz.find().populate('createdBy', 'name').sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('createdBy', 'name');
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    const questions = await Question.find({ quizId: req.params.id });
    res.json({ quiz, questions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, teacherOnly, async (req, res) => {
  try {
    const { title, topic, questions } = req.body;

    const quiz = await Quiz.create({
      title,
      topic,
      createdBy: req.user._id
    });

    if (questions && questions.length > 0) {
      const questionDocs = questions.map(q => ({
        quizId: quiz._id,
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer
      }));
      await Question.insertMany(questionDocs);
    }

    res.status(201).json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', protect, teacherOnly, async (req, res) => {
  try {
    const { title, topic, questions } = req.body;

    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    if (quiz.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this quiz' });
    }

    quiz.title = title || quiz.title;
    quiz.topic = topic || quiz.topic;
    await quiz.save();

    if (questions) {
      await Question.deleteMany({ quizId: quiz._id });
      const questionDocs = questions.map(q => ({
        quizId: quiz._id,
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer
      }));
      await Question.insertMany(questionDocs);
    }

    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', protect, teacherOnly, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    if (quiz.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this quiz' });
    }

    await Question.deleteMany({ quizId: quiz._id });
    await Submission.deleteMany({ quizId: quiz._id });
    await quiz.deleteOne();

    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
