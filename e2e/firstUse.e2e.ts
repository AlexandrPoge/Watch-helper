import { expect, test } from '@playwright/test'

const dune = { id: 'tmdb:movie:438631', title: 'Дюна', year: 2021, duration: '155 мин', match: 90 }

test('mobile home search puts film matches below the focused field', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 664 })
  await page.route('**/api/movies/search?**', route => route.fulfill({
    json: { items: new URL(route.request().url()).searchParams.get('q') === 'Дюна' ? [dune] : [] },
  }))
  await page.route('**/api/people/search?**', route => route.fulfill({
    json: { items: [{ id: 'tmdb:person:1', name: 'Киллиан Мёрфи', knownFor: ['Оппенгеймер'] }] },
  }))

  await page.goto('/')
  const input = page.getByRole('searchbox', { name: 'Найти фильм, сериал или актёра' })
  await input.pressSequentially('Дюна')
  await expect(input).toBeFocused()
  const results = page.getByRole('region', { name: 'Результаты поиска' })
  await expect(results.getByRole('link', { name: 'Дюна', exact: true })).toBeInViewport({ ratio: 1 })
  await expect(page.getByRole('complementary', { name: /Кинотеатральная сцена/ })).toHaveCount(0)

  await input.fill('Киллиан Мёрфи')
  await expect(results.getByRole('link', { name: /Киллиан Мёрфи/ })).toBeInViewport()
  await expect(results.getByText('Ничего не нашли')).toHaveCount(0)
  await page.getByRole('button', { name: 'Очистить поиск' }).click()
  await expect(input).toBeFocused()
  await expect(input).toHaveValue('')
  await expect(page.getByRole('heading', { name: /Твой идеальный фильм/ })).toBeVisible()
})

test('trailer keeps keyboard focus inside and returns it on close', async ({ page }) => {
  await page.route('**/api/movies/tmdb%3Amovie%3A438631', route => route.fulfill({
    json: { item: { ...dune, trailerUrl: 'https://www.youtube.com/watch?v=trailer', watchOptions: [], externalLinks: [], cast: [], similar: [] } },
  }))
  await page.route('https://www.youtube.com/embed/**', route => route.fulfill({ body: '<button>Play</button>', contentType: 'text/html' }))
  await page.goto('/movies/tmdb%3Amovie%3A438631')

  const trigger = page.getByRole('button', { name: 'Смотреть трейлер' })
  await trigger.press('Enter')
  const dialog = page.getByRole('dialog', { name: 'Трейлер' })
  const close = dialog.getByRole('button', { name: 'Закрыть трейлер' })
  await expect(close).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect.poll(() => dialog.evaluate(element => element.contains(document.activeElement) || document.activeElement === document.body)).toBe(true)
  await close.focus()
  await close.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()

  await trigger.press('Enter')
  await close.press('Enter')
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()
})
