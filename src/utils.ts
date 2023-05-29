import { ResponseCode, ResponseMsg } from './types';

export function wrapperResult(
  data?: any,
  status?: 'success' | 'error' | 'existed' | ''
) {
  const result = {
    code: ResponseCode.SUCCESS,
    msg: ResponseMsg.SUCCESS,
    data: {},
  };

  if (data === null) {
    if (status !== 'success') {
      result.code = ResponseCode.NONE;
      result.msg =
        status === 'error'
          ? ResponseMsg.FAIL
          : status === 'existed'
          ? ResponseMsg.EXISTED
          : ResponseMsg.NONE;
    }
  } else if (data && status === 'success') {
    result.data = data;
  }

  return result;
}
