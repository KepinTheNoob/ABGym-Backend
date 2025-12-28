import { NextFunction } from "express";
import { locale } from "../locales";

export const errBadRequest = (next: NextFunction, msg: string | string[]) => {
  return next({
    status: 400,
    msg,
  });
};

export const errForbidden = (next: NextFunction) => {
  return next({
    status: 403,
    msg: locale.forbidden,
  });
};

export const errNotFound = (next: NextFunction, msg: string) => {
  return next({
    status: 404,
    msg,
  });
};

export const errUnauthenticated = (next: NextFunction) => {
  return next({
    status: 401,
    msg: locale.unauthenticated,
  });
};

export const errConflict = (next: NextFunction, msg: string) => {
  return next({
    status: 409,
    msg,
  });
}

export const errInternalServer = (next: NextFunction) => {
  return next({
    status: 500,
    msg: locale.internalServer,
  });
};
