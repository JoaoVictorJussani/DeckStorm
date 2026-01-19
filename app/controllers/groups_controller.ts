import type { HttpContext } from '@adonisjs/core/http'
import Group from '#models/group'
import string from '@adonisjs/core/helpers/string'

export default class GroupsController {

    public async index({ view, auth }: HttpContext) {
        const user = auth.use('web').user!

        await user.load('createdGroups', (query) => {
            query.preload('members')
        })
        await user.load('joinedGroups', (query) => {
            query.preload('teacher')
        })

        const totalStudents = user.createdGroups.reduce((acc, group) => acc + (group.members ? group.members.length : 0), 0)

        return view.render('groups/index', {
            createdGroups: user.createdGroups,
            joinedGroups: user.joinedGroups,
            totalStudents
        })
    }

    public async create({ view }: HttpContext) {
        return view.render('groups/create')
    }

    public async store({ request, response, auth, session }: HttpContext) {
        const user = auth.use('web').user!
        const data = request.only(['name', 'description'])

        if (!data.name) {
            session.flash('error', 'Name is required')
            return response.redirect().back()
        }

        const inviteCode = string.random(8).toUpperCase()

        await user.related('createdGroups').create({
            name: data.name,
            description: data.description || '',
            inviteCode: inviteCode
        })

        session.flash('success', 'Group created successfully!')
        return response.redirect().toRoute('groups.index')
    }

    public async join({ request, response, auth, session }: HttpContext) {
        const user = auth.use('web').user!
        const code = request.input('code')

        if (!code) {
            session.flash('error', 'Code is required')
            return response.redirect().back()
        }

        const group = await Group.findBy('inviteCode', code.toUpperCase())

        if (!group) {
            session.flash('error', 'Invalid invite code')
            return response.redirect().back()
        }

        if (group.teacherId === user.id) {
            session.flash('info', 'You are the teacher of this group')
            return response.redirect().toRoute('groups.show', { id: group.id })
        }

        const isMember = await group.related('members').query().where('user_id', user.id).first()
        if (isMember) {
            session.flash('info', 'You are already a member of this group')
            return response.redirect().toRoute('groups.show', { id: group.id })
        }

        await group.related('members').attach([user.id])

        session.flash('success', 'Joined group successfully!')
        return response.redirect().toRoute('groups.index')
    }

    public async show({ params, view, auth, response }: HttpContext) {
        const user = auth.use('web').user!
        const group = await Group.find(params.id)

        if (!group) return response.notFound('Group not found')

        const isTeacher = group.teacherId === user.id

        let isMember = false
        if (!isTeacher) {
            const checkMember = await group.related('members').query().where('user_id', user.id).first()
            isMember = !!checkMember
        }

        if (!isTeacher && !isMember) {
            return response.unauthorized('Access denied')
        }

        await group.load('members', (query) => {
            query.preload('stats')
        })
        await group.load('teacher')
        await group.load('decks', (q) => {
            q.preload('user')
            q.withCount('cards')
        })

        // If teacher, allow them to add their own decks
        let teacherDecks: any[] = []
        if (isTeacher) {
            await user.load('decks')
            // Filter out decks already in the group
            const groupDeckIds = group.decks.map(d => d.id)
            teacherDecks = user.decks.filter(d => !groupDeckIds.includes(d.id))
        }

        // Sort members by XP (descending)
        const members = group.members.sort((a, b) => {
            const valA = a.stats ? a.stats.xp || 0 : 0
            const valB = b.stats ? b.stats.xp || 0 : 0
            if (valB !== valA) return valB - valA
            // Tie-break with correct answers
            return (b.stats?.correct_answers || 0) - (a.stats?.correct_answers || 0)
        })

        const topThree = members.slice(0, 3)

        const groupStats = {
            totalCorrect: members.reduce((acc, m) => acc + (m.stats?.correct_answers || 0), 0),
            totalDecks: members.reduce((acc, m) => acc + (m.stats?.decks_studied || 0), 0),
            totalStreaks: members.reduce((acc, m) => acc + (m.stats?.current_streak || 0), 0),
            totalXP: members.reduce((acc, m) => acc + (m.stats?.xp || 0), 0)
        }

        return view.render('groups/show', { group, isTeacher, isMember, members, topThree, groupStats, teacherDecks })
    }

    public async removeMember({ params, response, auth, session, request }: HttpContext) {
        const user = auth.use('web').user!
        const group = await Group.find(params.id)

        if (!group) return response.notFound()

        if (group.teacherId !== user.id) {
            return response.unauthorized()
        }

        const memberId = request.input('member_id')
        await group.related('members').detach([memberId])

        session.flash('success', 'Member removed')
        return response.redirect().back()
    }

    public async addDeck({ params, request, response, auth, session }: HttpContext) {
        const user = auth.use('web').user!
        const group = await Group.find(params.id)

        if (!group) return response.notFound()
        if (group.teacherId !== user.id) return response.unauthorized()

        const deckId = request.input('deck_id')
        if (!deckId) {
            session.flash('error', 'Select a deck')
            return response.redirect().back()
        }

        await group.related('decks').attach([deckId])

        session.flash('success', 'Deck added to group')
        return response.redirect().back()
    }

    public async removeDeck({ params, request, response, auth, session }: HttpContext) {
        const user = auth.use('web').user!
        const group = await Group.find(params.id)

        if (!group) return response.notFound()
        if (group.teacherId !== user.id) return response.unauthorized()

        const deckId = request.input('deck_id')
        await group.related('decks').detach([deckId])

        session.flash('success', 'Deck removed from group')
        return response.redirect().back()
    }
}
