const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  original: {
    type: String,
    required: true
  },
  suggestion: {
    type: String,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['grammar', 'vocabulary', 'expression', 'punctuation', 'style'],
    default: 'grammar'
  }
});

const diaryEntrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  mood: {
    type: String,
    required: true,
    trim: true
  },
  entry: {
    type: String,
    required: true,
    trim: true,
    maxlength: [5000, '일기 내용은 최대 5000자까지 가능합니다']
  },
  feedback: [feedbackSchema],
  learningSummary: {
    type: String,
    trim: true,
    maxlength: [1000, '학습 정리는 최대 1000자까지 가능합니다']
  },
  stats: {
    wordCount: {
      type: Number,
      default: 0
    },
    sentenceCount: {
      type: Number,
      default: 0
    },
    feedbackCount: {
      type: Number,
      default: 0
    },
    koreanWordsFound: {
      type: Number,
      default: 0
    },
    grammarErrors: {
      type: Number,
      default: 0
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editHistory: [{
    content: String,
    editedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// 복합 인덱스: 사용자별 날짜별 유니크
diaryEntrySchema.index({ user: 1, date: 1 }, { unique: true });

// 가상 필드: 날짜 문자열
diaryEntrySchema.virtual('dateString').get(function() {
  return this.date.toISOString().split('T')[0];
});

// 통계 자동 계산 미들웨어
diaryEntrySchema.pre('save', function(next) {
  if (this.isModified('entry')) {
    // 단어 수 계산
    this.stats.wordCount = this.entry.trim().split(/\s+/).length;
    
    // 문장 수 계산
    this.stats.sentenceCount = this.entry.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    
    // 피드백 수 계산
    this.stats.feedbackCount = this.feedback.length;
    
    // 한국어 단어 수 계산
    const koreanRegex = /[\uAC00-\uD7A3]/g;
    const koreanMatches = this.entry.match(koreanRegex);
    this.stats.koreanWordsFound = koreanMatches ? koreanMatches.length : 0;
    
    // 문법 오류 수 계산 (피드백에서 카테고리별로 계산)
    this.stats.grammarErrors = this.feedback.filter(f => 
      ['grammar', 'punctuation'].includes(f.category)
    ).length;
  }
  next();
});

// JSON 변환 시 가상 필드 포함
diaryEntrySchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('DiaryEntry', diaryEntrySchema);
