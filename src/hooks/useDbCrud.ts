import { db } from '../app';
import { ResponseCode } from '../types';
import { wrapperResult } from '../utils';
import { UseCrud } from './types';

/**
 * 封装数据库增删改查操作，同时也赋予其处理接口对客户端的回复能力
 */
function useDbCrud() {
  const getTable = (name: string) => db.collection(name);

  const onRead = async ({ table, filter, response, request }: UseCrud) => {
    const colect = getTable(table);
    const data = await colect.findOne(filter);
    if (!response && !request) {
      return data;
    }
    response?.status(200);
    if (data === null) {
      response?.send(wrapperResult(null, ResponseCode.NONE));
      return;
    }
    response?.send(wrapperResult(data, ResponseCode.SUCCESS));
  };

  const onCreate = async ({ table, filter, newData, response }: UseCrud) => {
    const hasData = await onRead({ table, filter });
    if (hasData !== null) {
      response?.send(wrapperResult(null, ResponseCode.EXISTED));
      return;
    }
    const colect = getTable(table);
    await colect.insertOne(newData!);
    if (response) {
      response.status(200);
      response.send(wrapperResult(newData, ResponseCode.SUCCESS));
    }
  };

  const onUpdate = async ({ table, filter, update, response }: UseCrud) => {
    const colect = getTable(table);
    await colect.updateOne(filter, update!);
    response?.status(200);
    response?.send(wrapperResult(null, ResponseCode.SUCCESS));
  };

  const onDelete = async ({ table, filter, response }: UseCrud) => {
    const colect = getTable(table);
    await colect.deleteOne(filter);
    if (response) {
      response.send(200);
      response.send(wrapperResult(null, ResponseCode.SUCCESS));
    }
  };

  return {
    /** 当数据已存在时则不会再次创建，否则新建数据 */
    create: onCreate,
    read: onRead,
    update: onUpdate,
    delete: onDelete,
  };
}

export { useDbCrud };
