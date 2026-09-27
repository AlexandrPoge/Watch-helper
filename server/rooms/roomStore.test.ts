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
})
