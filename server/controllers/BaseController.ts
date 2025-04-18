// src/controllers/BaseController.ts
import { Response } from 'express';

type SuccessResponse<T = undefined> = {
  success: true;
  statusCode: number;
  message: string;
  data?: T;
};

type ErrorResponse = {
  success: false;
  statusCode: number;
  message: string;
};

export abstract class BaseController {
  // Success response handler
  protected jsonResponse<T>(
    res: Response,
    statusCode: number,
    message: string,
    data?: T
  ): Response<SuccessResponse<T>> {
    const response: SuccessResponse<T> = {
      success: true,
      statusCode,
      message,
      ...(data && { data }),
    };

    return res.status(statusCode).json(response);
  }

  // Error response handler
  protected errorResponse(
    res: Response,
    statusCode: number,
    message: string,
    error?: unknown
  ): Response<ErrorResponse> {
    // // Log the actual error in development
    // if (process.env.NODE_ENV !== 'production' && error) {
    //   console.error('Error details:', error);
    // }
    console.error('Error details:', error);

    const response: ErrorResponse = {
      success: false,
      statusCode,
      message,
    };

    return res.status(statusCode).json(response);
  }
}