import { WithId } from 'mongodb';
import { ResponseCode, ResponseMsg, ResponseStatus } from './types';

export function wrapperResult(
  data?: WithId<Document> | null,
  status?: 'success' | 'error' | 'existed'
) {
  const result = {
    code: ResponseCode.SUCCESS,
    msg: ResponseMsg.SUCCESS,
  } as ResponseStatus<WithId<Document>>;

  if (data === null) {
    result.code = ResponseCode.NONE;
    result.msg =
      status === 'error'
        ? ResponseMsg.FAIL
        : status === 'existed'
        ? ResponseMsg.EXISTED
        : ResponseMsg.NONE;
  } else if (data && status === 'success') {
    result.data = data;
  }

  return result;
}
