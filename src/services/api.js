const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// API 요청 헬퍼 함수
const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || 'API 요청 중 오류가 발생했습니다');
    }

    return data;
  } catch (error) {
    console.error('API 요청 오류:', error);
    throw error;
  }
};

// 인증 관련 API
export const authAPI = {
  // 회원가입
  register: ({ nickname, password }) => 
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ nickname, password }),
    }),

  // 로그인
  login: ({ nickname, password }) => 
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ nickname, password }),
    }),

  // 사용자 정보 조회
  getProfile: () => 
    apiRequest('/auth/me'),

  // 프로필 업데이트
  updateProfile: (profileData) => 
    apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),

  // 비밀번호 변경
  changePassword: (passwordData) => 
    apiRequest('/auth/password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    }),
};

// 일기 관련 API
export const diaryAPI = {
  // 일기 목록 조회
  getEntries: (year, month) => {
    const params = new URLSearchParams();
    if (year) params.append('year', year);
    if (month) params.append('month', month);
    
    return apiRequest(`/diary/entries?${params.toString()}`);
  },

  // 특정 날짜 일기 조회
  getEntry: (date) => 
    apiRequest(`/diary/entries/${date}`),

  // 일기 작성/수정
  saveEntry: (entryData) => 
    apiRequest('/diary/entries', {
      method: 'POST',
      body: JSON.stringify(entryData),
    }),

  // 일기 삭제
  deleteEntry: (date) => 
    apiRequest(`/diary/entries/${date}`, {
      method: 'DELETE',
    }),

  // 통계 조회
  getStats: (period = 'all') => 
    apiRequest(`/diary/stats?period=${period}`),

  // 학습 정리 업데이트
  updateSummary: (date, summary) => 
    apiRequest(`/diary/entries/${date}/summary`, {
      method: 'PUT',
      body: JSON.stringify({ learningSummary: summary }),
    }),
};

// 토큰 관리
export const tokenManager = {
  // 토큰 저장
  setToken: (token) => {
    localStorage.setItem('token', token);
  },

  // 토큰 가져오기
  getToken: () => {
    return localStorage.getItem('token');
  },

  // 토큰 제거
  removeToken: () => {
    localStorage.removeItem('token');
  },

  // 토큰 유효성 확인
  isTokenValid: () => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch (error) {
      return false;
    }
  },
};

// 에러 처리
export const handleAPIError = (error) => {
  if (error.message.includes('401') || error.message.includes('토큰')) {
    tokenManager.removeToken();
    window.location.href = '/login';
    return '로그인이 필요합니다';
  }
  
  return error.message || '알 수 없는 오류가 발생했습니다';
};
