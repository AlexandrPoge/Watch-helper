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

  it('выбирает лидера после первого голоса', () => {
    const room = roomStore.create({ title: 'Выбор', mode: 'group', hostName: 'Аня' })
    const votingRoom = roomStore.startVoting(room.id)

    const updatedRoom = roomStore.vote(room.id, { memberId: room.members[0].id, movieId: votingRoom.candidates[1].id, value: 'up' })

    expect(updatedRoom.winnerId).toBe(votingRoom.candidates[1].id)
  })
})
