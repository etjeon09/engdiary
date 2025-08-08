import React, { useState } from 'react';

const Login = ({ onLogin }) => {
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 간단한 유효성 검사
      if (nickname.length < 2) {
        throw new Error('닉네임은 2자 이상이어야 합니다.');
      }
      if (password.length < 4) {
        throw new Error('비밀번호는 4자 이상이어야 합니다.');
      }

      if (isRegister) {
        // 회원가입: 닉네임 중복 체크
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const existingUser = users.find(u => u.nickname === nickname);
        if (existingUser) {
          throw new Error('이미 사용 중인 닉네임입니다.');
        }
        
        // 새 사용자 추가
        const newUser = { nickname, password, createdAt: new Date().toISOString() };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        onLogin({ nickname });
      } else {
        // 로그인: 사용자 확인
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.nickname === nickname && u.password === password);
        if (!user) {
          throw new Error('닉네임 또는 비밀번호가 올바르지 않습니다.');
        }
        
        onLogin({ nickname });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-xl p-8 w-full max-w-sm space-y-6">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
          {isRegister ? '회원가입' : '로그인'}
        </h2>
        <div>
          <label className="block text-gray-700 mb-1">닉네임</label>
          <input
            type="text"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            minLength={2}
            maxLength={20}
            required
            autoFocus
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-1">비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            minLength={4}
            maxLength={20}
            required
          />
        </div>
        {error && <div className="text-red-600 text-sm text-center">{error}</div>}
        <button
          type="submit"
          className="w-full py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors duration-200"
          disabled={loading}
        >
          {loading ? '처리 중...' : isRegister ? '회원가입' : '로그인'}
        </button>
        <div className="text-center text-sm mt-2">
          {isRegister ? (
            <span>
              이미 계정이 있으신가요?{' '}
              <button type="button" className="text-blue-600 underline" onClick={() => setIsRegister(false)}>
                로그인
              </button>
            </span>
          ) : (
            <span>
              계정이 없으신가요?{' '}
              <button type="button" className="text-blue-600 underline" onClick={() => setIsRegister(true)}>
                회원가입
              </button>
            </span>
          )}
        </div>
      </form>
    </div>
  );
};

export default Login;
