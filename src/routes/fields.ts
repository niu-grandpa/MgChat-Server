// 用于校验来自客户端接口的字段

export const loginFields = {
  upw: ['account', 'password'],
  phone: ['phoneNumber', 'code'],
};

export const registerFields = ['nickname', 'password', 'phoneNumber', 'code'];
