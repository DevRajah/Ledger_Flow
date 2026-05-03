import { Response } from "express";

// This helper makes every successful API response look the same.
//
// Future me:
// Instead of returning different shapes like { events }, { logs }, or direct arrays,
// we always return:
// {
//   success: true,
//   message: "...",
//   data: ...
// }
export const successResponse = (
  res: Response,
  message: string,
  data: any = null,
  statusCode = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

// This helper makes every error response look the same.
//
// Future me:
// This stops raw Prisma errors from leaking to the frontend.
export const errorResponse = (
  res: Response,
  message: string,
  error: any = null,
  statusCode = 500
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: error instanceof Error ? error.message : error,
  });
};