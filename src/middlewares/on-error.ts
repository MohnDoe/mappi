import type { ErrorHandler } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { StatusCodes } from 'http-status-codes'
import env from '@/env'

const onError: ErrorHandler = (err, c) => {
  const currentStatus = 'status' in err ? err.status : c.newResponse(null).status

  const statusCode = (currentStatus !== StatusCodes.OK ? currentStatus : StatusCodes.INTERNAL_SERVER_ERROR) as ContentfulStatusCode

  return c.json({
    message: err.message,
    stack: env.NODE_ENV === 'production' ? undefined : err.stack,
  }, statusCode)
}

export default onError
