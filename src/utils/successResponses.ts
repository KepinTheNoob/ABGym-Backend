import { Response } from "express";

export const successRes = (res: Response, data: any) => {
  return res.json(data);
};
