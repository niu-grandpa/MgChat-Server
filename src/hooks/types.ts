import { Request, Response } from 'express';
import { Document, Filter, UpdateFilter } from 'mongodb';
import { CollectionName } from '../types';
export interface UseApiHandler {
  /**接口response */
  response: Response;
  /**检查验证码是否有效 */
  verifyCaptcha?: { phoneNumber: string; code: string };
  /**校验必填参数字段和类型，如果不通过会阻止中间件函数执行 */
  required?: {
    /**目标对象 */
    target: any;
    /**必填字段 */
    must?: string[];
    check?: { type: string; fields: string[] }[];
  };
  /**中间件函数，按顺序执行。如果返回其中一个false则会中断执行 */
  middleware: Function[];
}

export interface UseCrud {
  table: CollectionName;
  response?: Response;
  request?: Request;
  filter?: Filter<Document>;
  update?: UpdateFilter<unknown>;
  newData?: Document;
  options?: any;
}
