import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getRecentRooms } from '../api/roomApi'

export function RoomCodeForm() {
  const [code, setCode] = useState('')
  const navigate = useNavigate()
  const recent = useQuery({ queryKey: ['recent-rooms'], queryFn: getRecentRooms })
  return <section><form className="mt-6 flex flex-wrap items-end gap-3" onSubmit={(event) => {
    event.preventDefault()
    navigate(`/rooms/${code}`)
  }}>
    <label className="text-sm font-semibold">Код приглашения
      <input required pattern="[A-F0-9]{10}" maxLength={10} title="10 символов от 0 до 9 и от A до F"
        value={code} onChange={(event) => setCode(event.target.value.trim().toUpperCase())}
        className="mt-2 block rounded-xl border border-white/20 bg-white/5 px-4 py-3 font-mono" />
    </label>
    <button className="rounded-xl bg-white/10 px-4 py-3 text-sm font-bold">Войти по коду</button>
  </form>
    {recent.isError && <button onClick={() => recent.refetch()}>Загрузить мои комнаты ещё раз</button>}
    {Boolean(recent.data?.length) && <nav aria-label="Мои комнаты" className="mt-6">
      <h2 className="text-lg font-bold">Мои комнаты</h2>
      <ul>{recent.data?.map((room) => <li key={room.id}><Link className="block py-2 underline" to={`/rooms/${room.id}`}>
        {room.title} · {room.status === 'open' ? 'Открыта' : 'Завершена'}
      </Link></li>)}</ul>
    </nav>}
  </section>
}
