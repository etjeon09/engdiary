const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  nickname: {
    type: String,
    required: [true, '닉네임은 필수입니다'],
    unique: true,
    trim: true,
    minlength: [2, '닉네임은 최소 2자 이상이어야 합니다'],
    maxlength: [20, '닉네임은 최대 20자까지 가능합니다']
  },
  password: {
    type: String,
    required: [true, '비밀번호는 필수입니다'],
    minlength: [4, '비밀번호는 최소 4자 이상이어야 합니다'],
    maxlength: [20, '비밀번호는 최대 20자까지 가능합니다']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 비밀번호 해싱
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
