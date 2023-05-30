import { Request, Response } from 'express';
import { TableProps } from '../types';

export type CrudOptions = {
  req: Request;
  res: Response;
  noSend?: boolean;
  newData?: any;
  filter?: any;
  tableProps?: TableProps;
};
