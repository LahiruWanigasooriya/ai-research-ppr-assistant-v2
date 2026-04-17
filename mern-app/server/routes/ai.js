const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const Chat = require('../models/Chat');

const PYTHON_API = process.env.PYTHON_API_URL || 'http://localhost:8000';

// Multer — memory storage (no disk writes)
const upload = multer({ storage: multer.memoryStorage() });

// ─────────────────────────────────────────────────────────
// 1. POST /api/upload
//    Accept PDF → proxy to Python → save Chat session
// ─────────────────────────────────────────────────────────
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Send a PDF as "file".' });
    }

    // Build multipart form for Python API
    const form = new FormData();
    form.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const pythonRes = await axios.post(`${PYTHON_API}/upload`, form, {
      headers: form.getHeaders(),
    });

    const sessionId = Date.now().toString();

    // Persist new chat session in MongoDB
    const chat = new Chat({
      sessionId,
      filename: req.file.originalname,
      messages: [],
    });
    await chat.save();

    return res.status(201).json({
      sessionId,
      filename: req.file.originalname,
      message: pythonRes.data.message || 'File uploaded successfully.',
      total_chunks: pythonRes.data.total_chunks ?? null,
    });
  } catch (err) {
    console.error('[/api/upload]', err.message);
    const status = err.response?.status || 500;
    return res
      .status(status)
      .json({ error: err.response?.data?.detail || err.message });
  }
});

// ─────────────────────────────────────────────────────────
// 2. POST /api/chat
//    { sessionId, question } → proxy to Python → persist messages
// ─────────────────────────────────────────────────────────
router.post('/chat', async (req, res) => {
  try {
    const { sessionId, question } = req.body;
    if (!sessionId || !question) {
      return res.status(400).json({ error: 'sessionId and question are required.' });
    }

    const pythonRes = await axios.post(`${PYTHON_API}/chat`, { question });
    const answer = pythonRes.data.answer;

    // Append both turns to the Chat document
    await Chat.findOneAndUpdate(
      { sessionId },
      {
        $push: {
          messages: {
            $each: [
              { role: 'user', content: question, timestamp: new Date() },
              { role: 'assistant', content: answer, timestamp: new Date() },
            ],
          },
        },
      },
      { new: true }
    );

    return res.json({ answer });
  } catch (err) {
    console.error('[/api/chat]', err.message);
    const status = err.response?.status || 500;
    return res
      .status(status)
      .json({ error: err.response?.data?.detail || err.message });
  }
});

// ─────────────────────────────────────────────────────────
// 3. POST /api/summarize
//    { sessionId } → proxy to Python → persist summary as assistant msg
// ─────────────────────────────────────────────────────────
router.post('/summarize', async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required.' });
    }

    const pythonRes = await axios.post(`${PYTHON_API}/summarize`);
    const summary = pythonRes.data.summary;

    await Chat.findOneAndUpdate(
      { sessionId },
      {
        $push: {
          messages: { role: 'assistant', content: summary, timestamp: new Date() },
        },
      },
      { new: true }
    );

    return res.json({ summary });
  } catch (err) {
    console.error('[/api/summarize]', err.message);
    const status = err.response?.status || 500;
    return res
      .status(status)
      .json({ error: err.response?.data?.detail || err.message });
  }
});

// ─────────────────────────────────────────────────────────
// 4. POST /api/keypoints
//    { sessionId } → proxy to Python → persist key points as assistant msg
// ─────────────────────────────────────────────────────────
router.post('/keypoints', async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required.' });
    }

    const pythonRes = await axios.post(`${PYTHON_API}/keypoints`);
    const key_points = pythonRes.data.key_points;

    const content = Array.isArray(key_points)
      ? key_points.join('\n')
      : String(key_points);

    await Chat.findOneAndUpdate(
      { sessionId },
      {
        $push: {
          messages: { role: 'assistant', content, timestamp: new Date() },
        },
      },
      { new: true }
    );

    return res.json({ key_points });
  } catch (err) {
    console.error('[/api/keypoints]', err.message);
    const status = err.response?.status || 500;
    return res
      .status(status)
      .json({ error: err.response?.data?.detail || err.message });
  }
});

// ─────────────────────────────────────────────────────────
// 5. GET /api/history/:sessionId
//    Return full Chat document for a session
// ─────────────────────────────────────────────────────────
router.get('/history/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const chat = await Chat.findOne({ sessionId });
    if (!chat) {
      return res.status(404).json({ error: `No session found for sessionId: ${sessionId}` });
    }
    return res.json(chat);
  } catch (err) {
    console.error('[/api/history]', err.message);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
