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
  let reasonText = "";
  
  // 1. Check for Korean words in English text
  const koreanWords = detectKoreanWords(processedSentence);
  if (koreanWords.length > 0) {
    koreanWords.forEach(koreanWord => {
      const englishEquivalent = suggestEnglishEquivalent(koreanWord);
      if (englishEquivalent) {
        processedSentence = processedSentence.replace(koreanWord, englishEquivalent);
        hasChanges = true;
        reasonText += `좋은 시도예요! '${koreanWord}'을(를) 영어로 표현할 때는 '${englishEquivalent}'라고 하면 더 자연스러워요. 영어 일기에서는 한국어 단어보다 영어 표현을 사용하는 것이 좋아요. `;
      } else {
        reasonText += `'${koreanWord}'은(는) 한국어 단어예요. 영어 일기에서는 영어 표현을 사용하는 것이 좋아요. 이 단어에 해당하는 영어 표현을 찾아보는 것도 학습에 도움이 된답니다. `;
      }
    });
  }
  
  // 2. Check if sentence starts with lowercase letter
  if (processedSentence.length > 0 && processedSentence[0] === processedSentence[0].toLowerCase() && 
      /^[a-z]/.test(processedSentence)) {
    processedSentence = processedSentence.charAt(0).toUpperCase() + processedSentence.slice(1);
    hasChanges = true;
    reasonText += "문장은 항상 대문자로 시작하는 것이 규칙이에요. 첫 글자를 대문자로 바꾸면 문장이 훨씬 깔끔하고 전문적으로 보여요. ";
  }
  
  // 3. Check if sentence starts with conjunction
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
    reasonText += `문장을 접속사('${firstWord}')로 시작하는 것은 자연스럽지 않아요. 접속사는 두 문장을 연결할 때 사용되며, 문장의 시작에는 적합하지 않아요. 문장을 더 자연스럽게 만들기 위해 접속사를 제거했어요. `;
  }
  
  // 4. Check for comma splice
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
      reasonText += "쉼표로 두 개의 완전한 문장을 연결하는 것은 문법 오류예요. 두 독립된 문장을 연결할 때는 마침표로 나누거나 접속사를 사용하는 것이 좋아요. 문장을 더 명확하게 만들기 위해 마침표로 나누었어요. ";
    }
  }
  
  // 5. Check for missing space after punctuation
  if (/[.,!?;:][a-zA-Z]/.test(processedSentence)) {
    processedSentence = processedSentence.replace(/([.,!?;:])([a-zA-Z])/g, '$1 $2');
    hasChanges = true;
    reasonText += "구두점(마침표, 쉼표, 느낌표 등) 뒤에는 반드시 공백을 넣어야 해요. 영어에서는 구두점과 다음 단어 사이에 공백을 두는 것이 표준이에요. ";
  }
  
  // 6. Check for inappropriate use of present tense for past events
  const irregularPastForms = {
    'go': 'went', 'see': 'saw', 'do': 'did', 'have': 'had', 'get': 'got', 
    'make': 'made', 'say': 'said', 'know': 'knew', 'take': 'took', 'come': 'came',
    'eat': 'ate', 'drink': 'drank', 'write': 'wrote', 'read': 'read', 'sleep': 'slept',
    'feel': 'felt', 'buy': 'bought', 'bring': 'brought', 'think': 'thought', 'catch': 'caught'
  };
  
  Object.entries(irregularPastForms).forEach(([present, past]) => {
    const regex = new RegExp(`\\b${present}\\b`, 'gi');
    if (regex.test(processedSentence) && !processedSentence.match(/\b(am|is|are|was|were|been|being)\b/gi)) {
      const timeIndicators = ['today', 'yesterday', 'morning', 'afternoon', 'evening', 'night', 'last', 'ago'];
      const hasTimeIndicator = timeIndicators.some(indicator => 
        processedSentence.toLowerCase().includes(indicator)
      );
      
      if (hasTimeIndicator || !processedSentence.match(/\b(now|currently|right now|these days)\b/gi)) {
        processedSentence = processedSentence.replace(regex, past);
        hasChanges = true;
        reasonText += `과거에 일어난 일을 서술할 때는 현재형 동사('${present}')보다 과거형('${past}')을 사용하는 것이 자연스러워요. 일기에서는 일반적으로 과거에 일어난 일을 서술하므로 과거형 동사를 사용하는 것이 좋아요. `;
      }
    }
  });
  
  // 7. Check for incorrect adjective usage with feelings
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
      reasonText += `기분을 표현할 때는 '-ed' 형태의 형용사를 사용하는 것이 자연스러워요. '${ingForm}'은(는) 어떤 것이 그 기분을 주는지를 설명할 때 사용하고, '${edForm}'은(는) 당신이 그 기분을 느낄 때 사용해요. 예를 들어, "The movie was ${ingForm}" (영화가 짜증나게 만들었다) vs "I was ${edForm}" (내가 짜증났다). `;
    }
  });
  
  // 8. Replace informal expressions with more formal ones
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
    'things': 'items or activities',
    'get': 'obtain or become',
    'make': 'create or cause'
  };
  
  Object.entries(informalToFormal).forEach(([informal, formal]) => {
    const regex = new RegExp(`\\b${informal}\\b`, 'gi');
    if (regex.test(processedSentence)) {
      processedSentence = processedSentence.replace(regex, formal);
      hasChanges = true;
      reasonText += `'${informal}'은(는) 비형식적인 표현이에요. '${formal}'와 같은 더 정교한 표현을 사용하면 글이 훨씬 좋아져요. 점점 더 자연스러운 영어를 구사하고 있네요! `;
    }
  });
  
  // 9. Improve vague expressions
  if (processedSentence.toLowerCase().includes('thing') || processedSentence.toLowerCase().includes('things')) {
    processedSentence = processedSentence.replace(/thing/gi, 'item or activity');
    processedSentence = processedSentence.replace(/things/gi, 'various activities or items');
    hasChanges = true;
    reasonText += "'thing'이나 'things'은 너무 모호한 표현이에요. 무엇을 의미하는지 더 구체적으로 설명하는 것이 좋아요. 구체적인 표현을 사용하면 독자가 더 잘 이해할 수 있어요. ";
  }
  
  // 10. Fix run-on sentences
  const longSentenceWords = processedSentence.split(' ');
  if (longSentenceWords.length > 25 && !processedSentence.includes('.')) {
    const breakPoint = Math.floor(longSentenceWords.length * 0.6);
    const firstPart = longSentenceWords.slice(0, breakPoint).join(' ');
    const secondPart = longSentenceWords.slice(breakPoint).join(' ');
    processedSentence = `${firstPart}. ${secondPart.charAt(0).toUpperCase() + secondPart.slice(1)}`;
    hasChanges = true;
    reasonText += "문장이 조금 길어서 두 개로 나누어 보았어요. 영어에서는 일반적으로 15-20단어를 넘는 긴 문장을 피하는 것이 좋아요. 문장을 적절히 나누면 더 명확하게 표현할 수 있어요. ";
  }
  
  // 11. Check for common article errors
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
        reasonText += `일부 장소를 나타내는 명사들(school, work, home 등)은 특정한 맥락에서 'the' 없이 사용하는 것이 자연스러워요. 예를 들어, "I go to school" (학교에 가다), "I'm at work" (일하고 있다), "I'm going home" (집에 가다)처럼 말해요. `;
      }
    }
  });
  
  // 12. If we've made changes, add feedback item
  if (hasChanges) {
    feedbackItems.push({
      original: originalSentence,
      suggestion: processedSentence,
      reason: reasonText.trim(),
      category: 'grammar'
    });
  } 
  // If no changes but sentence is reasonably long, provide constructive feedback
  else if (originalSentence.length > 15) {
    feedbackItems.push({
      original: originalSentence,
      suggestion: originalSentence,
      reason: "문장이 아주 잘 작성되었어요! 문법적으로도 올바르고 자연스러운 표현을 사용하고 계시네요. 계속 이렇게 좋은 습관을 유지해주세요. 더 나은 표현을 위해 다음을 시도해보세요: 1) 더 정교한 어휘 사용, 2) 다양한 문장 구조 사용, 3) 구체적인 설명 추가. 정말 훌륭한 시도예요! ",
      category: 'style'
    });
  }
  
  return feedbackItems;
};

const generateFeedback = (text) => {
  if (!text.trim()) return [];
  
  // Split text into sentences more accurately
  const sentences = text
    .replace(/([.!?])\s*(?=[A-Z])/g, "$1|")
    .replace(/([.!?])\s*(?=\s*[a-z])/g, "$1|")
    .replace(/\n+/g, "|")
    .split("|")
    .map(s => s.trim())
    .filter(s => s.length > 0);
  
  let allFeedback = [];
  
  sentences.forEach((sentence, index) => {
    const sentenceFeedback = analyzeSentence(sentence, index);
    allFeedback = allFeedback.concat(sentenceFeedback);
  });
  
  return allFeedback;
};

module.exports = {
  generateFeedback,
  detectKoreanWords,
  suggestEnglishEquivalent,
  analyzeSentence
};
