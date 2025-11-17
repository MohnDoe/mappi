import app from './app'

export default {
  // eslint-disable-next-line node/prefer-global/process
  port: process.env.PORT || 3000,
  fetch: app.fetch,
}
