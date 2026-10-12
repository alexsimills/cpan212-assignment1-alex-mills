
import { HttpError } from '../lib/http-error.js';

// Handle errors from the weather API
export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  // Handle expected errors
  if (err instanceof HttpError) {
    return res.status(err.status).json({
      error: {
        message: err.message,
        details: err.details ?? null
      }
    });
  }

  // Handle unexpected errors
  console.error(err);

  return res.status(500).json({
    error: {
      message: 'Internal server error'
    }
  });
}
