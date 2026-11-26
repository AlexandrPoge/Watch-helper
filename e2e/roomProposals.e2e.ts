import { expect, test, type Page } from '@playwright/test'

function watchRoomSocket(page: Page) {
  let updates = 0
  page.on('websocket', socket => {
    if (!socket.url().includes('/socket.io/')) return
    socket.on('framereceived', ({ payload }) => {
      if (typeof payload === 'string' && payload.startsWith('42["room:changed"')) updates++
    })
  })
  return () => updates
}

for (const mode of ['couple', 'group'] as const) test(`participants propose films and the host runs a blind ${mode} round`, async ({ page: host, browser }) => {
  const guestSession = await browser.newContext()
  let closeRoomUrl: string | undefined

  try {
    await host.goto(`/rooms/new?mode=${mode}`)
    await host.getByLabel('Название комнаты').fill('Браузерная проверка предложений')
    await host.getByLabel('Как тебя представить?').fill('Ведущий QA')
    await host.getByRole('button', { name: 'Создать комнату', exact: true }).click()
    await expect(host).toHaveURL(/\/rooms\/[A-F0-9]{10}$/)
    const roomUrl = new URL(host.url())
    closeRoomUrl = new URL('/api' + roomUrl.pathname + '/close', roomUrl).href
    await expect(host.getByText(/На связи/)).toBeVisible()

    const guest = await guestSession.newPage()
    const socketUpdates = watchRoomSocket(guest)
    await guest.goto(roomUrl.href)
    await guest.getByPlaceholder('Твоё имя').fill('Участник QA')
    await guest.getByRole('button', { name: 'Войти', exact: true }).click()
    await guest.getByText('Предложить фильм', { exact: true }).click()
    await guest.getByRole('searchbox', { name: 'Найти фильм' }).fill('Дюна')

    const search = guest.getByRole('list', { name: 'Результаты поиска' })
    const proposals = host.getByRole('list', { name: 'Предложенные фильмы' })
    for (const title of [/^Дюна · 2021/, /^Дюна: Часть вторая · 2024/]) {
      await search.getByRole('button', { name: title }).click()
      const entry = proposals.getByRole('listitem').filter({ hasText: title })
      await expect(entry).toBeVisible()
      await expect(entry.getByText('Предложение от Участник QA', { exact: true })).toBeVisible()
      await entry.getByRole('button', { name: 'В список голосования', exact: true }).click()
      await expect(host.getByRole('heading', { name: 'Список голосования', exact: true })).toBeFocused()
    }

    await expect(host.getByRole('list', { name: 'Фильмы для голосования' }).getByRole('listitem')).toHaveCount(2)
    await host.getByRole('checkbox', { name: /Слепой сеанс/ }).check()
    await host.getByRole('button', { name: 'Начать выбор', exact: true }).click()
    for (const participant of [host, guest]) {
      await expect(participant.getByRole('heading', { name: /Раунд 1 · Слепой сеанс/ })).toBeVisible()
      await expect(participant.getByRole('heading', { name: 'Предложения фильмов', exact: true })).toHaveCount(0)
      await expect(participant.getByText('Тайный фильм №1', { exact: true })).toBeVisible()
    }
    if (mode === 'group') {
      for (const [index, participant] of [host, guest].entries()) {
        const ballot = participant.getByRole('article').filter({ hasText: /Тайный фильм/ })
        await ballot.nth(index).getByRole('button', { name: 'Нравится' }).click()
        await ballot.nth(1 - index).getByRole('button', { name: 'Пропустить' }).click()
      }
      for (const participant of [host, guest]) {
        await expect(participant.getByRole('heading', { name: 'У нас ничья!', exact: true })).toBeVisible()
      }
      const draw = { name: 'Разрешить ничью жребием', exact: true }
      await expect(guest.getByRole('button', draw)).toHaveCount(0)
      await expect(guest.getByText('Ведущий может бросить жребий.')).toBeVisible()
      const updatesBeforeDraw = socketUpdates()
      await host.getByRole('button', draw).click()
      if (process.env.WATCH_HELPER_REQUIRE_WEBSOCKET === '1') {
        await expect.poll(socketUpdates).toBeGreaterThan(updatesBeforeDraw)
      }
      const history = (participant: typeof host) => participant.getByRole('region', { name: 'История выбора' }).getByRole('link')
      for (const participant of [host, guest]) {
        await expect(participant.getByText('Победитель выбран жеребьёвкой')).toBeVisible()
        await expect(history(participant)).toHaveCount(1)
        await expect(participant.getByText(/^Лидеры голосования/)).toContainText('Дюна: Часть вторая')
      }
      const winner = await history(host).getAttribute('href')
      await guest.reload()
      await expect(guest.getByText(/На связи/)).toBeVisible()
      await expect(history(guest)).toHaveAttribute('href', winner ?? '')
    }
  } finally {
    if (closeRoomUrl) await host.request.post(closeRoomUrl)
    await guestSession.close()
  }
})
