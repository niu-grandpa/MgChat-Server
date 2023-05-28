import { WithId } from 'mongodb';
import { ResponseCode, ResponseStatus } from './types';

export function wrapperResult(data: WithId<Document> | null) {
  const result = {
    code: ResponseCode.SUCCESS,
    msg: 'ok',
  } as ResponseStatus<WithId<Document>>;

  if (data === null) {
    result.code = ResponseCode.FAIL;
    result.msg = '未查询到该数据';
  } else {
    result.data = data;
  }

  return result;
}
