// 用于校验来自客户端接口的字段

export const loginFields = {
  upw: ['account', 'password', 'loginTime'],
  phone: ['phoneNumber', 'code', 'loginTime'],
};

export const registerFields = ['nickname', 'password', 'phoneNumber', 'code'];

export const logoutFields = ['?account', '?phoneNumber', 'logoutTime'];

export const forgetFields = ['phoneToken', 'code', 'password'];
