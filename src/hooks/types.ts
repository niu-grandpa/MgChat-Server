import { Response } from 'express';
export interface UseApiHandler {
  response: Response;
  required?: {
    target: object;
    check: { type: string; fields: string[] }[];
  };
  middleware: Function[];
}
