import { describe, expect, it } from 'vitest'
import { roomStore } from './roomStore'

describe('roomStore', () => {
  it('ограничивает комнату для пары двумя участниками', () => {
    const room = roomStore.create({ title: 'Кино на вечер', mode: 'couple', hostName: 'Аня' })
    roomStore.join(room.id, 'Макс')

    expect(() => roomStore.join(room.id, 'Ира')).toThrow('ROOM_IS_FULL')
  })

  it('не добавляет участника с одинаковым именем дважды', () => {
    const room = roomStore.create({ title: 'Друзья', mode: 'group', hostName: 'Аня' })
    roomStore.join(room.id, 'Макс')

    expect(roomStore.join(room.id, 'макс').members).toHaveLength(2)
  })

  it('выбирает лидера группы после первого голоса', () => {
    const room = roomStore.create({ title: 'Выбор', mode: 'group', hostName: 'Аня' })
    const votingRoom = roomStore.startVoting(room.id)

    const updatedRoom = roomStore.vote(room.id, { memberId: room.members[0].id, movieId: votingRoom.candidates[1].id, value: 'up' })

    expect(updatedRoom.winnerId).toBe(votingRoom.candidates[1].id)
  })

  it('не объявляет лидера группы после пропуска', () => {
    const room = roomStore.create({ title: 'Выбор', mode: 'group', hostName: 'Аня' })
    const votingRoom = roomStore.startVoting(room.id)
    const updated = roomStore.vote(room.id, { memberId: room.members[0].id, movieId: votingRoom.candidates[0].id, value: 'skip' })
    expect(updated.winnerId).toBeUndefined()
  })

  it('создаёт совпадение пары только после двух лайков', () => {
    const room = roomStore.create({ title: 'Для двоих', mode: 'couple', hostName: 'Аня' })
    const joined = roomStore.join(room.id, 'Макс')
    const votingRoom = roomStore.startVoting(room.id)
    const movieId = votingRoom.candidates[0].id
    expect(roomStore.vote(room.id, { memberId: room.members[0].id, movieId, value: 'up' }).winnerId).toBeUndefined()
    expect(roomStore.vote(room.id, { memberId: joined.members[1].id, movieId, value: 'up' }).winnerId).toBe(movieId)
  })
})
