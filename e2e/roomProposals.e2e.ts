import { expect, test } from '@playwright/test'

test('participants propose films and the host starts a blind round', async ({ page: host, browser }) => {
  const guestSession = await browser.newContext()
  let closeRoomUrl: string | undefined

  try {
    await host.goto('/rooms/new?mode=couple')
    await host.getByLabel('Название комнаты').fill('Браузерная проверка предложений')
    await host.getByLabel('Как тебя представить?').fill('Ведущий QA')
    await host.getByRole('button', { name: 'Создать комнату', exact: true }).click()
    await expect(host).toHaveURL(/\/rooms\/[A-F0-9]{10}$/)
    const roomUrl = new URL(host.url())
    closeRoomUrl = new URL('/api' + roomUrl.pathname + '/close', roomUrl).href
    await expect(host.getByText(/На связи/)).toBeVisible()

    const guest = await guestSession.newPage()
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
      await expect(participant.getByRole('heading', { name: 'Тайный фильм №1', exact: true })).toBeVisible()
    }
  } finally {
    if (closeRoomUrl) await host.request.post(closeRoomUrl)
    await guestSession.close()
  }
})
