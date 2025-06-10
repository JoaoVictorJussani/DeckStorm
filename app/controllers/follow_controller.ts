import type { HttpContext } from '@adonisjs/core/http'
import Follow from '#models/follow'
import User from '#models/user'

export default class FollowController {
  async follow({ params, auth, response }: HttpContext) {
    const followerId = auth.user.id
    const followingId = Number(params.id)
    if (followerId === followingId) {
      return response.badRequest('Impossible de se suivre soi-même')
    }
    const exists = await Follow.query()
      .where('follower_id', followerId)
      .andWhere('following_id', followingId)
      .first()
    if (!exists) {
      await Follow.create({ follower_id: followerId, following_id: followingId })
    }
    return response.redirect().back()
  }

  async unfollow({ params, auth, response }: HttpContext) {
    const followerId = auth.user.id
    const followingId = Number(params.id)
    await Follow.query()
      .where('follower_id', followerId)
      .andWhere('following_id', followingId)
      .delete()
    return response.redirect().back()
  }
}
