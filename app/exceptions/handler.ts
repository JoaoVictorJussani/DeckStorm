import app from '@adonisjs/core/services/app'
import { HttpContext, ExceptionHandler } from '@adonisjs/core/http'
import type { StatusPageRange, StatusPageRenderer } from '@adonisjs/core/types/http'
// import { errors } from '@adonisjs/limiter'
import { DateTime } from 'luxon'
import logger from '@adonisjs/core/services/logger'

export default class HttpExceptionHandler extends ExceptionHandler {
  /**
   * In debug mode, the exception handler will display verbose errors
   * with pretty printed stack traces.
   */
  protected debug = !app.inProduction

  /**
   * Status pages are used to display a custom HTML pages for certain error
   * codes. You might want to enable them in production only, but feel
   * free to enable them in development as well.
   */
  protected renderStatusPages = app.inProduction

  /**
   * Status pages is a collection of error code range and a callback
   * to return the HTML contents to send as a response.
   */
  protected statusPages: Record<StatusPageRange, StatusPageRenderer> = {
    '404': async (error, { view, auth }) => {
      const user = auth?.user
      return view.render('pages/errors/not_found', { error, user })
    },
    '500..599': (error, { view }) => {
      return view.render('pages/errors/server_error', { error })
    },
  }

  /**
   * The method is used for handling errors and returning
   * response to the client
   */
  async handle(error: unknown, ctx: HttpContext) {
    // console.log('DEBUG: Error caught:', error) // Uncomment for debugging
    if ((error as any).code === 'E_TOO_MANY_REQUESTS' || (error as any).status === 429) {
      logger.warn({ ip: ctx.request.ip(), url: ctx.request.url() }, 'Rate limit exceeded')
      const retryAfter = (error as any).retryAfter || 600
      const unlockTime = DateTime.now().plus({ seconds: retryAfter, hours: 1 }).toFormat('HH:mm:ss')
      ctx.session.flash('error', `Trop de tentatives. Vous êtes bloqué. Réessayez à ${unlockTime}.`)
      return ctx.response.redirect().back()
    }

    if ((error as any).code === 'E_AUTHORIZATION_FAILURE' || (error as any).status === 403) {
      const user = ctx.auth?.user
      logger.warn(
        {
          user_id: user?.id || 'guest',
          ip: ctx.request.ip(),
          url: ctx.request.url(),
          method: ctx.request.method(),
        },
        'Unauthorized access attempt (403)'
      )

      const html = await ctx.view.render('pages/errors/forbidden')
      return ctx.response.status(403).send(html)
    }
    return super.handle(error, ctx)
  }

  /**
   * The method is used to report error to the logging service or
   * the a third party error monitoring service.
   *
   * @note You should not attempt to send a response from this method.
   */
  async report(error: unknown, ctx: HttpContext) {
    return super.report(error, ctx)
  }
}
