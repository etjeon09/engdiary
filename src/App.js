import React, { useState, useEffect } from "react";
import Login from "./Login";

const App = () => {
  // 모든 Hook을 최상단에서 호출
  const [user, setUser] = useState(null);
  
  // 한국 시간 기준으로 오늘 날짜 계산
  const getTodayDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [mood, setMood] = useState('');
  const [customMood, setCustomMood] = useState('');
  const [diaryEntry, setDiaryEntry] = useState('');
  const [feedback, setFeedback] = useState([]);
  const [diaryEntries, setDiaryEntries] = useState({});
  const [showCustomMoodInput, setShowCustomMoodInput] = useState(false);
  const [learningSummary, setLearningSummary] = useState('');

  // 로그인 상태 확인
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Load saved entries from localStorage
  useEffect(() => {
    if (user) { // 로그인된 상태에서만 실행
      const userKey = `diaryEntries_${user.nickname}`;
      const savedEntries = localStorage.getItem(userKey);
      if (savedEntries) {
        const parsedEntries = JSON.parse(savedEntries);
        setDiaryEntries(parsedEntries);
        // 현재 선택된 날짜의 데이터만 로드
        if (parsedEntries[selectedDate]?.learningSummary) {
          setLearningSummary(parsedEntries[selectedDate].learningSummary);
        }
      } else {
        // 새로운 사용자의 경우 빈 객체로 초기화
        setDiaryEntries({});
        setLearningSummary('');
      }
    }
  }, [user, selectedDate]); // selectedDate 의존성 다시 추가

  // 로그인 핸들러
  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // 로그아웃 핸들러
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    // 사용자별 데이터는 유지 (다시 로그인할 수 있도록)
  };

  // 로그인 상태가 아니면 로그인 화면 표시
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const moods = [
    { name: 'Happy', emoji: '😊' },
    { name: 'Sad', emoji: '😢' },
    { name: 'Excited', emoji: '🎉' },
    { name: 'Anxious', emoji: '😰' },
    { name: 'Calm', emoji: '🧘' },
    { name: 'Stressed', emoji: '😫' },
    { name: 'Grateful', emoji: '🙏' },
    { name: 'Tired', emoji: '😴' },
    { name: 'Energetic', emoji: '⚡' },
    { name: 'Hopeful', emoji: '🌟' },
    { name: 'Frustrated', emoji: '😤' },
    { name: 'Content', emoji: '😌' },
    { name: 'Lonely', emoji: '😔' },
    { name: 'Inspired', emoji: '💡' },
    { name: 'Bored', emoji: '🥱' },
    { name: 'Confident', emoji: '💪' },
    { name: 'Nervous', emoji: '😬' },
    { name: 'Peaceful', emoji: '🕊️' },
    { name: 'Overwhelmed', emoji: '😵' },
    { name: 'Curious', emoji: '🔍' },
    { name: 'Relieved', emoji: '😅' },
    { name: 'Disappointed', emoji: '😞' },
    { name: 'Proud', emoji: '🏆' },
    { name: 'Ashamed', emoji: '😳' },
    { name: 'Optimistic', emoji: '☀️' },
    { name: 'Pessimistic', emoji: '🌧️' },
    { name: 'Motivated', emoji: '🚀' },
    { name: 'Drained', emoji: '🔋' },
    { name: 'Playful', emoji: '🎈' },
    { name: 'Serious', emoji: '👔' }
  ];

  // Save entries to localStorage with user-specific key
  const saveEntries = (entries) => {
    setDiaryEntries(entries);
    try {
      const userKey = `diaryEntries_${user.nickname}`;
      localStorage.setItem(userKey, JSON.stringify(entries));
    } catch (e) {
      console.warn('Could not save to localStorage', e);
    }
  };

  const detectKoreanWords = (text) => {
    const koreanRegex = /[\uAC00-\uD7A3]/;
    const words = text.split(/\s+/);
    const koreanWords = [];
    
    words.forEach(word => {
      const cleanWord = word.replace(/[.,!?;:()"'-]/g, '');
      if (koreanRegex.test(cleanWord) && cleanWord.length > 1) {
        koreanWords.push(cleanWord);
      }
    });
    
    return koreanWords;
  };

  const suggestEnglishEquivalent = (koreanWord) => {
    const dictionary = {
      '평영': 'breaststroke',
      '배영': 'backstroke',
      '자유형': 'freestyle',
      '접영': 'butterfly stroke',
      '밥': 'meal',
      '점심': 'lunch',
      '아침': 'breakfast',
      '저녁': 'dinner',
      '학교': 'school',
      '회사': 'office',
      '친구': 'friend',
      '가족': 'family',
      '엄마': 'mom',
      '아빠': 'dad',
      '형': 'older brother',
      '누나': 'older sister',
      '오빠': 'older brother (female speaker)',
      '언니': 'older sister (female speaker)',
      '선생님': 'teacher',
      '학생': 'student',
      '운동': 'exercise',
      '공부': 'study',
      '놀이': 'play',
      '여행': 'trip',
      '휴가': 'vacation',
      '생일': 'birthday',
      '결혼': 'marriage',
      '이별': 'breakup',
      '사랑': 'love',
      '기쁨': 'joy',
      '슬픔': 'sadness',
      '화남': 'anger',
      '두려움': 'fear'
    };
    
    return dictionary[koreanWord] || null;
  };

  const analyzeSentence = (sentence, index) => {
    const feedbackItems = [];
    let processedSentence = sentence.trim();
    
    if (!processedSentence) return feedbackItems;
    
    const originalSentence = processedSentence;
    let hasChanges = false;
    let reasons = []; // 배열로 변경하여 각 오류별로 구분
    
    // 1. Check for Korean words in English text
    const koreanWords = detectKoreanWords(processedSentence);
    if (koreanWords.length > 0) {
      koreanWords.forEach(koreanWord => {
        const englishEquivalent = suggestEnglishEquivalent(koreanWord);
        if (englishEquivalent) {
          processedSentence = processedSentence.replace(koreanWord, englishEquivalent);
          hasChanges = true;
          reasons.push(`• '${koreanWord}'을(를) '${englishEquivalent}'로 바꾸세요.\n  영어 일기에서는 영어 표현을 사용하는 것이 좋아요.`);
        } else {
          reasons.push(`• '${koreanWord}'은(는) 한국어 단어예요.\n  영어 표현을 찾아서 사용해보세요.`);
        }
      });
    }
    
    // 2. Fix "to do" grammar errors (to did, to went, etc.)
    const toInfinitiveErrors = {
      'to did': 'to do',
      'to went': 'to go',
      'to saw': 'to see',
      'to ate': 'to eat',
      'to drank': 'to drink',
      'to wrote': 'to write',
      'to slept': 'to sleep',
      'to felt': 'to feel',
      'to bought': 'to buy',
      'to brought': 'to bring',
      'to thought': 'to think',
      'to caught': 'to catch',
      'to knew': 'to know',
      'to took': 'to take',
      'to came': 'to come'
    };
    
    Object.entries(toInfinitiveErrors).forEach(([incorrect, correct]) => {
      const regex = new RegExp(`\\b${incorrect}\\b`, 'gi');
      if (regex.test(processedSentence)) {
        processedSentence = processedSentence.replace(regex, correct);
        hasChanges = true;
        reasons.push(`• '${incorrect}' → '${correct}': 'to' 뒤에는 동사의 원형을 사용해야 해요.\n  예: to do, to go, to see, to eat`);
      }
    });
    
    // 3. Fix common verb tense errors in context (but avoid affecting "to do" patterns)
    const contextBasedTenseFixes = {
      'I am go': 'I am going',
      'I am went': 'I went',
      'I am do': 'I am doing',
      'I am did': 'I did',
      'I am eat': 'I am eating',
      'I am ate': 'I ate',
      'I am see': 'I am seeing',
      'I am saw': 'I saw',
      'I am have': 'I have',
      'I am had': 'I had',
      'I am get': 'I am getting',
      'I am got': 'I got',
      'I am make': 'I am making',
      'I am made': 'I made',
      'I am take': 'I am taking',
      'I am took': 'I took',
      'I am come': 'I am coming',
      'I am came': 'I came'
    };
    
    Object.entries(contextBasedTenseFixes).forEach(([incorrect, correct]) => {
      const regex = new RegExp(`\\b${incorrect}\\b`, 'gi');
      if (regex.test(processedSentence)) {
        processedSentence = processedSentence.replace(regex, correct);
        hasChanges = true;
        reasons.push(`• '${incorrect}' → '${correct}': 'am' 뒤에는 동사의 -ing 형태나 과거형을 사용해야 해요.\n  현재진행형: I am going, I am eating\n  과거형: I went, I ate`);
      }
    });
    
    // 4. Check if sentence starts with lowercase letter
    if (processedSentence.length > 0 && processedSentence[0] === processedSentence[0].toLowerCase() && 
        /^[a-z]/.test(processedSentence)) {
      processedSentence = processedSentence.charAt(0).toUpperCase() + processedSentence.slice(1);
      hasChanges = true;
      reasons.push(`• 문장은 대문자로 시작해야 해요.\n  예: "i went to school" → "I went to school"`);
    }
    
    // 5. Check if sentence starts with conjunction
    const conjunctions = ['and', 'but', 'or', 'so', 'because', 'although', 'though', 'since', 'while'];
    const firstWord = processedSentence.split(' ')[0].toLowerCase().replace(/[.,!?;:]/g, '');
    
    if (conjunctions.includes(firstWord)) {
      const words = processedSentence.split(' ');
      words.shift();
      processedSentence = words.join(' ');
      if (processedSentence.length > 0) {
        processedSentence = processedSentence.charAt(0).toUpperCase() + processedSentence.slice(1);
      }
      hasChanges = true;
      reasons.push(`• 문장을 접속사('${firstWord}')로 시작하지 마세요.\n  접속사는 두 문장을 연결할 때 사용해요.\n  예: "I was tired. So I went to bed early."`);
    }
    
    // 6. Check for comma splice
    if (processedSentence.includes(',') && 
        (processedSentence.includes(' I ') || processedSentence.includes(' He ') || 
         processedSentence.includes(' She ') || processedSentence.includes(' It ') ||
         processedSentence.includes(' We ') || processedSentence.includes(' They '))) {
      const commaIndex = processedSentence.indexOf(',');
      const afterComma = processedSentence.substring(commaIndex + 1).trim();
      
      if (afterComma.length > 0 && /^[A-Z][a-z]/.test(afterComma)) {
        processedSentence = processedSentence.substring(0, commaIndex) + '. ' + 
                          afterComma.charAt(0).toUpperCase() + afterComma.slice(1);
        hasChanges = true;
        reasons.push(`• 쉼표로 두 개의 완전한 문장을 연결하지 마세요.\n  마침표로 나누거나 접속사를 사용하세요.\n  예: "I was tired, I went to bed" → "I was tired. I went to bed"`);
      }
    }
    
    // 7. Check for missing space after punctuation
    if (/[.,!?;:][a-zA-Z]/.test(processedSentence)) {
      processedSentence = processedSentence.replace(/([.,!?;:])([a-zA-Z])/g, '$1 $2');
      hasChanges = true;
      reasons.push(`• 구두점 뒤에는 공백을 넣어야 해요.\n  예: "I went to school.It was fun." → "I went to school. It was fun."`);
    }
    
    // 8. Check for inappropriate use of present tense for past events
    const irregularPastForms = {
      'go': 'went', 'see': 'saw', 'do': 'did', 'have': 'had', 'get': 'got', 
      'make': 'made', 'say': 'said', 'know': 'knew', 'take': 'took', 'come': 'came',
      'eat': 'ate', 'drink': 'drank', 'write': 'wrote', 'read': 'read', 'sleep': 'slept',
      'feel': 'felt', 'buy': 'bought', 'bring': 'brought', 'think': 'thought', 'catch': 'caught'
    };
    
    Object.entries(irregularPastForms).forEach(([present, past]) => {
      // "to do" 패턴을 건드리지 않도록 예외 처리
      const regex = new RegExp(`\\b${present}\\b`, 'gi');
      if (regex.test(processedSentence) && !processedSentence.match(/\b(am|is|are|was|were|been|being)\b/gi)) {
        const timeIndicators = ['today', 'yesterday', 'morning', 'afternoon', 'evening', 'night', 'last', 'ago'];
        const hasTimeIndicator = timeIndicators.some(indicator => 
          processedSentence.toLowerCase().includes(indicator)
        );
        
        // "to do" 패턴이 있는 경우 건드리지 않음
        const hasToDoPattern = processedSentence.toLowerCase().includes(`to ${present}`);
        
        if ((hasTimeIndicator || !processedSentence.match(/\b(now|currently|right now|these days)\b/gi)) && !hasToDoPattern) {
          processedSentence = processedSentence.replace(regex, past);
          hasChanges = true;
          reasons.push(`• 과거 일을 서술할 때는 '${present}' → '${past}'를 사용하세요.\n  일기에서는 일반적으로 과거형을 사용해요.\n  예: "I go to school" → "I went to school"`);
        }
      }
    });
    
    // 9. Check for incorrect adjective usage with feelings
    const feelingAdjectives = {
      'frustrating': 'frustrated',
      'exciting': 'excited',
      'boring': 'bored',
      'tiring': 'tired',
      'surprising': 'surprised',
      'interesting': 'interested',
      'confusing': 'confused',
      'amazing': 'amazed',
      'shocking': 'shocked',
      'disappointing': 'disappointed',
      'satisfying': 'satisfied',
      'worrying': 'worried',
      'terrifying': 'terrified',
      'pleasing': 'pleased',
      'annoying': 'annoyed'
    };
    
    Object.entries(feelingAdjectives).forEach(([ingForm, edForm]) => {
      const regex = new RegExp(`\\bI\\s+(am|was|feel|felt)\\s+${ingForm}\\b`, 'gi');
      if (regex.test(processedSentence)) {
        processedSentence = processedSentence.replace(regex, (match) => {
          return match.replace(new RegExp(`${ingForm}`, 'i'), edForm);
        });
        hasChanges = true;
        reasons.push(`• 기분 표현에는 '${ingForm}' → '${edForm}'를 사용하세요.\n  -ing: 어떤 것이 그 기분을 주는지 (The movie was exciting)\n  -ed: 당신이 그 기분을 느낄 때 (I was excited)`);
      }
    });
    
    // 10. Replace informal expressions with more formal ones
    const informalToFormal = {
      'a lot': 'significantly',
      'kind of': 'somewhat',
      'sort of': 'rather',
      'gonna': 'going to',
      'wanna': 'want to',
      'gotta': 'have to',
      'pretty': 'quite',
      'really': 'very',
      'very very': 'extremely',
      'super': 'extremely',
      'awesome': 'excellent',
      'cool': 'great',
      'bad': 'poor',
      'stuff': 'things',
      'get': 'obtain or become',
      'make': 'create or cause'
    };
    
    Object.entries(informalToFormal).forEach(([informal, formal]) => {
      const regex = new RegExp(`\\b${informal}\\b`, 'gi');
      if (regex.test(processedSentence)) {
        processedSentence = processedSentence.replace(regex, formal);
        hasChanges = true;
        reasons.push(`• '${informal}' → '${formal}': 더 정교한 표현을 사용하세요.\n  비형식적 표현보다 형식적인 표현이 일기에 적합해요.`);
      }
    });
    
    // 11. Improve vague expressions (moved to end to avoid conflicts)
    if (processedSentence.toLowerCase().includes('thing') || processedSentence.toLowerCase().includes('things')) {
      processedSentence = processedSentence.replace(/\bthing\b/gi, 'item or activity');
      processedSentence = processedSentence.replace(/\bthings\b/gi, 'various activities or items');
      hasChanges = true;
      reasons.push(`• 'thing/things' → 더 구체적인 표현을 사용하세요.\n  모호한 표현보다 구체적인 설명이 좋아요.\n  예: "I did many things" → "I did various activities"`);
    }
    
    // 12. Fix run-on sentences
    const longSentenceWords = processedSentence.split(' ');
    if (longSentenceWords.length > 25 && !processedSentence.includes('.')) {
      const breakPoint = Math.floor(longSentenceWords.length * 0.6);
      const firstPart = longSentenceWords.slice(0, breakPoint).join(' ');
      const secondPart = longSentenceWords.slice(breakPoint).join(' ');
      processedSentence = `${firstPart}. ${secondPart.charAt(0).toUpperCase() + secondPart.slice(1)}`;
      hasChanges = true;
      reasons.push(`• 긴 문장을 두 개로 나누세요.\n  15-20단어를 넘는 문장은 피하는 것이 좋아요.\n  문장을 나누면 더 명확하게 표현할 수 있어요.`);
    }
    
    // 13. Check for common article errors
    const commonNouns = ['school', 'work', 'home', 'bed', 'hospital', 'church', 'college', 'university'];
    commonNouns.forEach(noun => {
      const regex = new RegExp(`\\bthe\\s+${noun}\\b`, 'gi');
      if (regex.test(processedSentence) && !processedSentence.match(/\b(in|at|to|from) the\b/gi)) {
        const noArticleContexts = ['go to', 'be at', 'come from', 'arrive at'];
        const hasNoArticleContext = noArticleContexts.some(context => 
          processedSentence.toLowerCase().includes(context)
        );
        
        if (hasNoArticleContext) {
          processedSentence = processedSentence.replace(regex, noun);
          hasChanges = true;
          reasons.push(`• 'the ${noun}' → '${noun}': 일부 장소명사는 'the' 없이 사용해요.\n  예: go to school, be at work, go home`);
        }
      }
    });
    
    // 14. Check for missing articles before singular countable nouns
    const countableNouns = ['book', 'movie', 'car', 'house', 'friend', 'teacher', 'student', 'dog', 'cat', 'phone', 'computer', 'table', 'chair', 'window', 'door'];
    countableNouns.forEach(noun => {
      const regex = new RegExp(`\\b${noun}\\b`, 'gi');
      if (regex.test(processedSentence)) {
        const beforeNoun = processedSentence.substring(0, processedSentence.toLowerCase().indexOf(noun.toLowerCase()));
        const afterNoun = processedSentence.substring(processedSentence.toLowerCase().indexOf(noun.toLowerCase()) + noun.length);
        
        // Check if there's already an article before the noun
        const hasArticle = /\b(a|an|the|my|your|his|her|its|our|their)\s+$/i.test(beforeNoun);
        const isPlural = /\b\w+s\b/i.test(processedSentence);
        
        if (!hasArticle && !isPlural && !beforeNoun.match(/\b(in|at|on|to|from|with|by|for|of)\s+$/i)) {
          const vowelSound = /^[aeiou]/i.test(noun);
          const article = vowelSound ? 'an' : 'a';
          processedSentence = processedSentence.replace(regex, `${article} ${noun}`);
          hasChanges = true;
          reasons.push(`• '${noun}' → '${article} ${noun}': 단수 가산명사 앞에는 관사를 사용하세요.\n  예: a book, an apple, the car`);
        }
      }
    });
    
    // 15. Check for double negatives
    if (processedSentence.toLowerCase().includes('not') && 
        (processedSentence.toLowerCase().includes('no') || processedSentence.toLowerCase().includes('never') || 
         processedSentence.toLowerCase().includes('nothing') || processedSentence.toLowerCase().includes('nobody'))) {
      processedSentence = processedSentence.replace(/\bnot\b/gi, '');
      processedSentence = processedSentence.replace(/\s+/g, ' ').trim();
      hasChanges = true;
      reasons.push(`• 이중 부정을 피하세요.\n  'not'과 'no/never' 등을 함께 사용하지 마세요.\n  예: "I don't have no money" → "I have no money"`);
    }
    
    // 16. If we've made changes, add feedback item
    if (hasChanges) {
      feedbackItems.push({
        original: originalSentence,
        suggestion: processedSentence,
        reason: reasons.join('\n\n') // 각 피드백 사이에 빈 줄 추가
      });
    } 
    // If no changes but sentence is reasonably long, provide constructive feedback
    else if (originalSentence.length > 15) {
      feedbackItems.push({
        original: originalSentence,
        suggestion: originalSentence,
        reason: "• 문장이 아주 잘 작성되었어요!\n\n• 더 나은 표현을 위해 다음을 시도해보세요:\n  - 더 정교한 어휘 사용\n  - 다양한 문장 구조 사용\n  - 구체적인 설명 추가"
      });
    }
    
    return feedbackItems;
  };

  const generateFeedback = (text) => {
    if (!text.trim()) return [];
    
    const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
    const allFeedback = [];
    
    sentences.forEach((sentence, index) => {
      const feedback = analyzeSentence(sentence, index);
      allFeedback.push(...feedback);
    });
    
    // Add contextual suggestions based on the overall text
    if (allFeedback.length === 0 && text.length > 50) {
      const contextualSuggestions = generateContextualSuggestions(text);
      allFeedback.push(...contextualSuggestions);
    }
    
    return allFeedback.slice(0, 5); // Limit to 5 feedback items
  };

  const generateContextualSuggestions = (text) => {
    const suggestions = [];
    const lowerText = text.toLowerCase();
    
    // Check for repetitive sentence structures
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const sentenceStarts = sentences.map(s => s.trim().split(' ')[0].toLowerCase());
    const startCounts = {};
    
    sentenceStarts.forEach(start => {
      startCounts[start] = (startCounts[start] || 0) + 1;
    });
    
    const repetitiveStart = Object.entries(startCounts).find(([word, count]) => count > 2);
    if (repetitiveStart) {
      suggestions.push({
        original: `문장들이 '${repetitiveStart[0]}'로 시작하는 경우가 많아요.`,
        suggestion: "다양한 문장 시작을 시도해보세요: 'I', 'The', 'It', 'There', 'This', 'That' 등을 활용하면 더 흥미로운 글이 됩니다.",
        reason: "• 같은 단어로 문장을 시작하면 글의 흐름이 단조로워져요.\n\n• 다양한 문장 구조를 사용하면 더 자연스럽고 읽기 쉬운 글이 됩니다.\n\n• 예시:\n  - I went to school today.\n  - The weather was beautiful.\n  - It was a great day.\n  - There were many people.\n  - This experience taught me a lot."
      });
    }
    
    // Check for vocabulary variety
    const words = lowerText.split(/\s+/).filter(word => word.length > 3);
    const wordCounts = {};
    words.forEach(word => {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    });
    
    const overusedWords = Object.entries(wordCounts).filter(([word, count]) => count > 3);
    if (overusedWords.length > 0) {
      const word = overusedWords[0][0];
      const alternatives = getWordAlternatives(word);
      if (alternatives.length > 0) {
        suggestions.push({
          original: `'${word}' 단어를 여러 번 사용했어요.`,
          suggestion: `다른 표현을 시도해보세요: ${alternatives.join(', ')}`,
          reason: "• 같은 단어를 반복 사용하면 글의 표현력이 떨어져요.\n\n• 다양한 동의어를 사용하면 더 풍부한 표현이 가능합니다.\n\n• 문맥에 맞는 적절한 단어를 선택하세요."
        });
      }
    }
    
    // Check for text length and structure
    if (text.length < 100) {
      suggestions.push({
        original: "일기가 조금 짧아요.",
        suggestion: "더 자세한 설명을 추가해보세요: 언제, 어디서, 누구와, 무엇을, 어떻게, 왜에 대한 정보를 포함하면 더 풍부한 일기가 됩니다.",
        reason: "• 짧은 일기보다는 구체적인 세부사항을 포함한 긴 일기가 영어 학습에 더 도움이 됩니다.\n\n• 5W1H(언제, 어디서, 누구와, 무엇을, 어떻게, 왜)를 고려해서 작성해보세요.\n\n• 예시:\n  - 언제: Yesterday morning, Last weekend\n  - 어디서: at the park, in the library\n  - 누구와: with my friends, alone\n  - 무엇을: studied English, watched a movie\n  - 어떻게: carefully, quickly, slowly\n  - 왜: because I wanted to learn, since it was interesting"
      });
    }
    
    return suggestions;
  };

  const getWordAlternatives = (word) => {
    const alternatives = {
      'good': ['excellent', 'great', 'wonderful', 'fantastic', 'amazing', 'outstanding'],
      'bad': ['terrible', 'awful', 'horrible', 'dreadful', 'poor', 'disappointing'],
      'big': ['large', 'huge', 'enormous', 'massive', 'gigantic', 'substantial'],
      'small': ['tiny', 'little', 'miniature', 'petite', 'compact', 'modest'],
      'happy': ['joyful', 'delighted', 'pleased', 'content', 'cheerful', 'elated'],
      'sad': ['unhappy', 'depressed', 'melancholy', 'gloomy', 'sorrowful', 'down'],
      'tired': ['exhausted', 'weary', 'fatigued', 'drained', 'worn out', 'sleepy'],
      'angry': ['furious', 'mad', 'irritated', 'annoyed', 'upset', 'frustrated'],
      'scared': ['afraid', 'frightened', 'terrified', 'panicked', 'nervous', 'worried'],
      'surprised': ['shocked', 'amazed', 'astonished', 'stunned', 'bewildered', 'startled'],
      'like': ['enjoy', 'love', 'appreciate', 'adore', 'fancy', 'prefer'],
      'dislike': ['hate', 'detest', 'loathe', 'abhor', 'despise', 'can\'t stand'],
      'say': ['tell', 'speak', 'talk', 'mention', 'explain', 'describe'],
      'go': ['visit', 'travel', 'head', 'move', 'proceed', 'journey'],
      'come': ['arrive', 'reach', 'approach', 'appear', 'show up', 'turn up'],
      'see': ['watch', 'observe', 'notice', 'spot', 'witness', 'view'],
      'think': ['believe', 'consider', 'suppose', 'imagine', 'assume', 'feel'],
      'know': ['understand', 'realize', 'recognize', 'comprehend', 'grasp', 'see'],
      'want': ['desire', 'wish', 'hope', 'need', 'require', 'would like'],
      'get': ['obtain', 'receive', 'acquire', 'gain', 'achieve', 'attain']
    };
    
    return alternatives[word] || [];
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const currentMood = customMood || mood;
    if (!currentMood || !diaryEntry.trim()) {
      alert('기분을 선택하고 일기 내용을 작성해주세요.');
      return;
    }

    const newEntry = {
      mood: currentMood,
      entry: diaryEntry,
      feedback: generateFeedback(diaryEntry),
      learningSummary: learningSummary
    };

    const updatedEntries = {
      ...diaryEntries,
      [selectedDate]: newEntry
    };
    
    saveEntries(updatedEntries);
    setFeedback(newEntry.feedback);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    const entry = diaryEntries[date];
    if (entry) {
      setMood(entry.mood);
      setCustomMood('');
      setDiaryEntry(entry.entry);
      setFeedback(entry.feedback || []);
      setLearningSummary(entry.learningSummary || '');
    } else {
      setMood('');
      setCustomMood('');
      setDiaryEntry('');
      setFeedback([]);
      setLearningSummary('');
    }
  };

  const handleMoodSelect = (selectedMood) => {
    setMood(selectedMood);
    setCustomMood('');
    setShowCustomMoodInput(false);
  };

  const handleCustomMood = () => {
    setShowCustomMoodInput(true);
    setMood('');
  };

  const handleLearningSummaryChange = (e) => {
    setLearningSummary(e.target.value);
    if (diaryEntries[selectedDate]) {
      const updatedEntries = {
        ...diaryEntries,
        [selectedDate]: {
          ...diaryEntries[selectedDate],
          learningSummary: e.target.value
        }
      };
      saveEntries(updatedEntries);
    }
  };

  const renderCalendar = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDate = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      const day = new Date(currentDate);
      // 한국 시간 기준으로 날짜 문자열 생성
      const year = day.getFullYear();
      const month = String(day.getMonth() + 1).padStart(2, '0');
      const date = String(day.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${date}`;
      
      const hasEntry = diaryEntries[dateStr];
      
      days.push(
        <div
          key={i}
          className={`p-2 text-center cursor-pointer rounded transition-all duration-200 ${
            day.getMonth() === month - 1
              ? 'text-gray-700 hover:bg-blue-50'
              : 'text-gray-400'
          } ${
            dateStr === selectedDate
              ? 'bg-blue-500 text-white font-semibold'
              : hasEntry
              ? 'bg-green-100 hover:bg-green-200'
              : 'hover:bg-gray-100'
          }`}
          onClick={() => handleDateChange(dateStr)}
        >
          <div className="text-sm">{day.getDate()}</div>
          {hasEntry && (
            <div className="w-1 h-1 bg-green-500 rounded-full mx-auto mt-1"></div>
          )}
        </div>
      );
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="text-center mb-8 flex flex-col items-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">일기장 📔</h1>
          <p className="text-lg text-gray-600 mb-2">영어로 일기를 쓰고 친절한 선생님처럼 피드백을 받아보세요</p>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-blue-700 font-semibold">{user.nickname}님 환영합니다!</span>
            <button onClick={handleLogout} className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm">로그아웃</button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar and Mood Section */}
          <div className="lg:col-span-1 space-y-6">
            {/* Calendar */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">📅 달력</h2>
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {renderCalendar()}
              </div>
            </div>

            {/* Mood Selection */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">😊 오늘의 기분</h2>
              <div className="grid grid-cols-2 gap-2 mb-4 max-h-60 overflow-y-auto">
                {moods.map((moodItem) => (
                  <button
                    key={moodItem.name}
                    onClick={() => handleMoodSelect(moodItem.name)}
                    className={`p-2 text-sm rounded-lg transition-all duration-200 flex items-center gap-2 ${
                      mood === moodItem.name
                        ? 'bg-blue-500 text-white font-medium'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="text-lg">{moodItem.emoji}</span>
                    <span>{moodItem.name}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={handleCustomMood}
                className="w-full p-2 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <span>➕</span> 직접 기분 입력하기
              </button>
              
              {showCustomMoodInput && (
                <div className="mt-4">
                  <input
                    type="text"
                    value={customMood}
                    onChange={(e) => setCustomMood(e.target.value)}
                    placeholder="기분을 입력하세요..."
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Diary and Feedback Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Date Display */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {new Date(selectedDate).toLocaleDateString('ko-KR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </h2>
              {diaryEntries[selectedDate] && (
                <div className="text-sm text-gray-600">
                  기분: <span className="font-medium text-blue-600">{diaryEntries[selectedDate].mood}</span>
                </div>
              )}
            </div>

            {/* Diary Entry */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">✏️ 오늘의 일기</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <textarea
                  value={diaryEntry}
                  onChange={(e) => setDiaryEntry(e.target.value)}
                  placeholder={`Today was a great day. 
I went to the park with my friends. 
We had a wonderful time together.`}
                  className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-400 font-medium"
                  style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif' }}
                />
                <div className="text-sm text-gray-500">
                  일기를 쓸 때 다음을 참고해보세요: 오늘의 기분, 했던 일, 만난 사람, 느낀 점, 
                  내일의 계획 등에 대해 자유롭게 영어로 작성해보세요. 완벽한 문장을 쓰려고 
                  애쓰기보다는 자유롭게 표현하는 데 집중해보세요!
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 font-medium flex items-center gap-2"
                  >
                    <span>✅</span> 저장하고 피드백 받기
                  </button>
                </div>
              </form>
            </div>

            {/* AI Feedback */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">🤖 AI 선생님의 피드백</h2>
              {feedback.length > 0 ? (
                <div className="space-y-6">
                  {feedback.map((item, index) => (
                    <div key={index} className="border-l-4 border-blue-400 pl-4 py-3 bg-blue-50 rounded-r-lg">
                      <div className="mb-3">
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded mb-2">
                          💬 피드백 #{index + 1}
                        </span>
                        <div>
                          <span className="font-medium text-gray-700">📝 원문:</span>
                          <p className="text-gray-800 mt-1 bg-white p-2 rounded border">{item.original}</p>
                        </div>
                      </div>
                      <div className="mb-3">
                        <span className="font-medium text-gray-700">✨ 개선 제안:</span>
                        <p className="text-green-800 mt-1 bg-white p-2 rounded border font-medium">{item.suggestion}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">📘 상세 설명:</span>
                        <p className="text-gray-700 mt-1 text-sm leading-relaxed bg-white p-3 rounded border border-gray-200 whitespace-pre-line">
                          {item.reason}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 italic text-center py-8 bg-gray-50 rounded-lg">
                  <div className="text-4xl mb-2">👋</div>
                  일기를 작성하고 "저장하고 피드백 받기" 버튼을 클릭하면,<br />
                  친절한 AI 선생님이 문장별로 상세한 피드백을 제공해드려요!
                </div>
              )}
            </div>

            {/* Learning Summary */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">🌟 오늘의 학습 정리</h2>
              <p className="text-gray-600 mb-4 text-sm">
                오늘 일기 작성과 피드백을 통해 배운 내용을 간단히 정리해보세요. 이는 당신의 학습 여정을 되돌아보는 데 큰 도움이 됩니다.
              </p>
              <textarea
                value={learningSummary}
                onChange={handleLearningSummaryChange}
                placeholder="예: 오늘은 과거형 동사 사용법과 문장을 자연스럽게 연결하는 방법을 배웠어요. 특히 'and'로 문장을 시작하는 것을 피하고, 대신 마침표나 접속사를 사용하는 것이 더 자연스럽다는 것을 알게 되었어요."
                className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-400"
              />
              <p className="text-xs text-gray-500 mt-2">
                💡 팁: 구체적인 예시와 함께 정리하면 기억에 더 오래 남아요!
              </p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">✨ 사용 팁:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-blue-600 mb-2">✓ 기분 선택:</h4>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>각 감정 옆에 해당하는 이모지가 있어요</li>
                <li>기분이 정확히 맞지 않으면 직접 입력할 수 있어요</li>
                <li>달력에서 초록색 점은 일기를 쓴 날짜를 의미해요</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-600 mb-2">✓ 일기 작성:</h4>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>한글과 영어를 섞어 써도 괜찮아요 (피드백에서 자동으로 수정해드려요)</li>
                <li>문법 오류가 있어도 괜찮아요 (배우는 과정이니까요!)</li>
                <li>학습 정리를 꼭 작성해보세요 (기억에 오래 남아요)</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>💡 학습 조언:</strong> 매일 조금씩이라도 꾸준히 작성하는 것이 가장 중요해요. 
              오늘 배운 내용을 내일 일기에 적용해보는 것도 좋은 방법이에요!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
