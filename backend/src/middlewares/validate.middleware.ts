import { AnyZodObject, ZodError } from 'zod';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';

// Runs a Zod schema against req.body, req.query, and req.params before the controller.
// On failure: throws ApiError(400) with field-level errors so the frontend knows exactly
// which fields failed and why.
// On success: the parsed + transformed data is written back to req so controllers get clean values.
export const validate = (schema: AnyZodObject) =>
  asyncHandler(async (req, _res, next) => {
    const result = await schema.safeParseAsync({
      body:   req.body,
      query:  req.query,
      params: req.params,
    });

    if (!result.success) {
      const { fieldErrors } = (result.error as ZodError).flatten();
      throw new ApiError(400, 'Validation failed.', fieldErrors);
    }

    // Write parsed values back so controllers get coerced + trimmed data
    if (result.data.body)   req.body   = result.data.body;
    if (result.data.query)  req.query  = result.data.query;
    if (result.data.params) req.params = result.data.params;

    next();
  });
