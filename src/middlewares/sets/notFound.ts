import type { NotFoundHandler } from 'hono'
import { StatusCodes } from 'http-status-codes'

const setNotFound: NotFoundHandler = (c) => {
  return c.json({
    message: `Set not found.`,
  }, StatusCodes.NOT_FOUND)
}

export default setNotFound
