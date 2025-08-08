const express = require('express');
const DiaryEntry = require('../models/DiaryEntry');
const auth = require('../middleware/auth');
const { generateFeedback } = require('../utils/feedbackGenerator');

const router = express.Router();

// 모든 라우터에 인증 미들웨어 적용
router.use(auth);

// 일기 목록 조회 (월별)
router.get('/entries', async (req, res) => {
  try {
    const { year, month } = req.query;
    const userId = req.user.userId;

    let query = { user: userId };
    
    if (year && month) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const entries = await DiaryEntry.find(query)
      .sort({ date: -1 })
      .select('date mood entry stats learningSummary');

    // 날짜별로 그룹화
    const groupedEntries = {};
    entries.forEach(entry => {
      const dateStr = entry.date.toISOString().split('T')[0];
      groupedEntries[dateStr] = entry;
    });

    res.json({
      entries: groupedEntries,
      total: entries.length
    });

  } catch (error) {
    console.error('일기 목록 조회 오류:', error);
    res.status(500).json({
      error: '일기 목록 조회 중 오류가 발생했습니다',
      message: error.message
    });
  }
});

// 특정 날짜 일기 조회
router.get('/entries/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const userId = req.user.userId;

    const entry = await DiaryEntry.findOne({
      user: userId,
      date: new Date(date)
    });

    if (!entry) {
      return res.status(404).json({
        error: '일기를 찾을 수 없습니다',
        message: '해당 날짜의 일기가 존재하지 않습니다'
      });
    }

    res.json({ entry });

  } catch (error) {
    console.error('일기 조회 오류:', error);
    res.status(500).json({
      error: '일기 조회 중 오류가 발생했습니다',
      message: error.message
    });
  }
});

// 일기 작성/수정
router.post('/entries', async (req, res) => {
  try {
    const { date, mood, entry, learningSummary } = req.body;
    const userId = req.user.userId;

    if (!date || !mood || !entry) {
      return res.status(400).json({
        error: '필수 정보가 누락되었습니다',
        message: '날짜, 기분, 일기 내용을 모두 입력해주세요'
      });
    }

    // 피드백 생성
    const feedback = generateFeedback(entry);

    // 기존 일기 확인
    let diaryEntry = await DiaryEntry.findOne({
      user: userId,
      date: new Date(date)
    });

    if (diaryEntry) {
      // 기존 일기 수정
      diaryEntry.mood = mood;
      diaryEntry.entry = entry;
      diaryEntry.feedback = feedback;
      diaryEntry.learningSummary = learningSummary || diaryEntry.learningSummary;
      diaryEntry.isEdited = true;
      
      // 편집 히스토리에 추가
      diaryEntry.editHistory.push({
        content: entry,
        editedAt: new Date()
      });

      await diaryEntry.save();
    } else {
      // 새 일기 생성
      diaryEntry = new DiaryEntry({
        user: userId,
        date: new Date(date),
        mood,
        entry,
        feedback,
        learningSummary
      });

      await diaryEntry.save();
    }

    res.json({
      message: diaryEntry.isEdited ? '일기가 수정되었습니다' : '일기가 저장되었습니다',
      entry: diaryEntry
    });

  } catch (error) {
    console.error('일기 저장 오류:', error);
    res.status(500).json({
      error: '일기 저장 중 오류가 발생했습니다',
      message: error.message
    });
  }
});

// 일기 삭제
router.delete('/entries/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const userId = req.user.userId;

    const entry = await DiaryEntry.findOneAndDelete({
      user: userId,
      date: new Date(date)
    });

    if (!entry) {
      return res.status(404).json({
        error: '일기를 찾을 수 없습니다',
        message: '해당 날짜의 일기가 존재하지 않습니다'
      });
    }

    res.json({
      message: '일기가 삭제되었습니다'
    });

  } catch (error) {
    console.error('일기 삭제 오류:', error);
    res.status(500).json({
      error: '일기 삭제 중 오류가 발생했습니다',
      message: error.message
    });
  }
});

// 통계 조회
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { period = 'all' } = req.query;

    let dateFilter = {};
    
    if (period === 'month') {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      dateFilter = { $gte: startOfMonth };
    } else if (period === 'week') {
      const now = new Date();
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      dateFilter = { $gte: startOfWeek };
    }

    const entries = await DiaryEntry.find({
      user: userId,
      date: dateFilter
    });

    // 통계 계산
    const stats = {
      totalEntries: entries.length,
      totalWords: entries.reduce((sum, entry) => sum + entry.stats.wordCount, 0),
      totalSentences: entries.reduce((sum, entry) => sum + entry.stats.sentenceCount, 0),
      totalFeedback: entries.reduce((sum, entry) => sum + entry.stats.feedbackCount, 0),
      averageWordsPerEntry: entries.length > 0 
        ? Math.round(entries.reduce((sum, entry) => sum + entry.stats.wordCount, 0) / entries.length)
        : 0,
      averageFeedbackPerEntry: entries.length > 0
        ? Math.round(entries.reduce((sum, entry) => sum + entry.stats.feedbackCount, 0) / entries.length * 10) / 10
        : 0,
      koreanWordsFound: entries.reduce((sum, entry) => sum + entry.stats.koreanWordsFound, 0),
      grammarErrors: entries.reduce((sum, entry) => sum + entry.stats.grammarErrors, 0),
      streak: 0, // 연속 작성일 계산 로직 필요
      mostUsedMood: null
    };

    // 가장 많이 사용된 기분 계산
    const moodCounts = {};
    entries.forEach(entry => {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
    });
    
    if (Object.keys(moodCounts).length > 0) {
      stats.mostUsedMood = Object.entries(moodCounts)
        .sort(([,a], [,b]) => b - a)[0][0];
    }

    res.json({ stats });

  } catch (error) {
    console.error('통계 조회 오류:', error);
    res.status(500).json({
      error: '통계 조회 중 오류가 발생했습니다',
      message: error.message
    });
  }
});

// 학습 정리 업데이트
router.put('/entries/:date/summary', async (req, res) => {
  try {
    const { date } = req.params;
    const { learningSummary } = req.body;
    const userId = req.user.userId;

    const entry = await DiaryEntry.findOneAndUpdate(
      {
        user: userId,
        date: new Date(date)
      },
      { learningSummary },
      { new: true }
    );

    if (!entry) {
      return res.status(404).json({
        error: '일기를 찾을 수 없습니다',
        message: '해당 날짜의 일기가 존재하지 않습니다'
      });
    }

    res.json({
      message: '학습 정리가 업데이트되었습니다',
      entry
    });

  } catch (error) {
    console.error('학습 정리 업데이트 오류:', error);
    res.status(500).json({
      error: '학습 정리 업데이트 중 오류가 발생했습니다',
      message: error.message
    });
  }
});

module.exports = router;
