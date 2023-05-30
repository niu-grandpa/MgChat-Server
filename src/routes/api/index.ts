import { Request, Response } from 'express';
import { useCheckParams } from '../../hooks';
import { ClientQueryFields } from '../../types';

export const crudHandler = ({
  req,
  res,
  next,
  fields,
}: {
  req: Request;
  res: Response;
  fields: string[];
  next: () => any;
}) => {
  const params = req.body as ClientQueryFields;
  const pass = useCheckParams(fields, params);
  if (pass === true) {
    next();
  } else {
    res.status(pass.code);
    res.send(pass.msg);
  }
};

export * from './forget';
export * from './info';
export * from './login';
export * from './logout';
export * from './register';
