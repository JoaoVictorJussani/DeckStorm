import type { HttpContext } from '@adonisjs/core/http'
import Follow from '#models/follow'
import Notification from '#models/notification'

export default class FollowController {
  async follow({ params, auth, response }: HttpContext) {
    if (!auth.user) {
      return response.unauthorized('Utilisateur non authentifié')
    }
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
      // Notificação pour le suivi avec nom du follower
      const follower = auth.user
      await Notification.create({
        user_id: followingId,
        message: `"${follower.username}" a commencé à vous suivre`,
        type: 'follow',
      })
    }
    return response.redirect().back()
  }

  async unfollow({ params, auth, response }: HttpContext) {
    if (!auth.user) {
      return response.unauthorized('Utilisateur non authentifié')
    }
    const followerId = auth.user.id
    const followingId = Number(params.id)
    await Follow.query()
      .where('follower_id', followerId)
      .andWhere('following_id', followingId)
      .delete()
    return response.redirect().back()
  }
}
