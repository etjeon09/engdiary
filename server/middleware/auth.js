const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    // 헤더에서 토큰 추출
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        error: '인증 토큰이 필요합니다',
        message: '로그인이 필요합니다'
      });
    }

    // 토큰 검증
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // 요청 객체에 사용자 정보 추가
    req.user = decoded;
    
    next();
  } catch (error) {
    console.error('토큰 검증 오류:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: '토큰이 만료되었습니다',
        message: '다시 로그인해주세요'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: '유효하지 않은 토큰입니다',
        message: '다시 로그인해주세요'
      });
    }
    
    res.status(500).json({
      error: '토큰 검증 중 오류가 발생했습니다',
      message: error.message
    });
  }
};

module.exports = auth;
