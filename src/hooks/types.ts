import { Request, Response } from 'express';
import { DbTables } from '../types';

export type CrudOptions = {
  req: Request;
  res: Response;
  table: DbTables;
  noSend?: boolean;
};
