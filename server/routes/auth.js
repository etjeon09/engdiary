const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// 회원가입
router.post('/register', async (req, res) => {
  try {
    const { nickname, password } = req.body;
    if (!nickname || !password) {
      return res.status(400).json({ error: '닉네임과 비밀번호를 모두 입력해주세요.' });
    }
    if (password.length < 4) {
      return res.status(400).json({ error: '비밀번호는 최소 4자 이상이어야 합니다.' });
    }
    // 닉네임 중복 체크
    const existing = await User.findOne({ nickname });
    if (existing) {
      return res.status(409).json({ error: '이미 사용 중인 닉네임입니다.' });
    }
    const user = new User({ nickname, password });
    await user.save();
    const token = jwt.sign({ userId: user._id, nickname: user.nickname }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.status(201).json({ message: '회원가입 성공', user: user.toJSON(), token });
  } catch (e) {
    res.status(500).json({ error: '회원가입 중 오류가 발생했습니다.' });
  }
});

// 로그인
router.post('/login', async (req, res) => {
  try {
    const { nickname, password } = req.body;
    if (!nickname || !password) {
      return res.status(400).json({ error: '닉네임과 비밀번호를 모두 입력해주세요.' });
    }
    const user = await User.findOne({ nickname });
    if (!user) {
      return res.status(401).json({ error: '닉네임 또는 비밀번호가 올바르지 않습니다.' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: '닉네임 또는 비밀번호가 올바르지 않습니다.' });
    }
    const token = jwt.sign({ userId: user._id, nickname: user.nickname }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.json({ message: '로그인 성공', user: user.toJSON(), token });
  } catch (e) {
    res.status(500).json({ error: '로그인 중 오류가 발생했습니다.' });
  }
});

// 내 정보
const auth = require('../middleware/auth');
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    res.json({ user: user.toJSON() });
  } catch (e) {
    res.status(500).json({ error: '내 정보 조회 중 오류가 발생했습니다.' });
  }
});

module.exports = router;
