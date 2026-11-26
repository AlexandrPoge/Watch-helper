import { Suspense, lazy, useLayoutEffect, useRef } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { MobileNav } from '../pages/components/MobileNav'
import { TechBackground } from '../pages/components/TechBackground'
import { PagesPreviewNotice } from './PagesPreviewNotice'
import { RoomsPreviewPage } from '../pages/RoomsPreviewPage'
import { isPagesPreview } from '../shared/config/pagesPreview'

const HomePage = lazy(() => import('../pages/HomePage').then((module) => ({ default: module.HomePage })))
const CreateRoomPage = lazy(() => import('../pages/CreateRoomPage').then((module) => ({ default: module.CreateRoomPage })))
const RoomPage = lazy(() => import('../pages/RoomPage').then((module) => ({ default: module.RoomPage })))
const SeriesDetailsPage = lazy(() => import('../pages/SeriesDetailsPage').then((module) => ({ default: module.SeriesDetailsPage })))
const SeriesPage = lazy(() => import('../pages/SeriesPage').then((module) => ({ default: module.SeriesPage })))
const MoviesPage = lazy(() => import('../pages/MoviesPage').then((module) => ({ default: module.MoviesPage })))
const MovieDetailsPage = lazy(() => import('../pages/MovieDetailsPage').then((module) => ({ default: module.MovieDetailsPage })))
const PersonPage = lazy(() => import('../pages/PersonPage').then((module) => ({ default: module.PersonPage })))
const ProfilePage = lazy(() => import('../pages/ProfilePage').then((module) => ({ default: module.ProfilePage })))
const RandomMoviePage = lazy(() => import('../pages/RandomMoviePage').then((module) => ({ default: module.RandomMoviePage })))
const queryClient = new QueryClient()
const Router = isPagesPreview ? HashRouter : BrowserRouter

export function App() {
  return (
    <Router><QueryClientProvider client={queryClient}><a href="#app-content" onClick={(event) => { event.preventDefault(); document.getElementById('app-content')?.focus() }} className="skip-link">Перейти к содержимому</a><PagesPreviewNotice /><TechBackground /><AnimatedRoutes /><MobileNav /></QueryClientProvider></Router>
  )
}

function AnimatedRoutes() {
  const location = useLocation()
  const content = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    content.current?.focus({ preventScroll: true })
  }, [location.pathname])
  return <div ref={content} id="app-content" tabIndex={-1} className="page-transition"><Suspense fallback={<div role="status" className="min-h-screen p-8 text-sm text-slate-400">Загружаем страницу…</div>}><Routes location={location}>
      <Route path="/" element={<HomePage />} />
      <Route path="/series" element={<SeriesPage />} />
      <Route path="/movies" element={<MoviesPage />} />
      <Route path="/series/:catalogId" element={<SeriesDetailsPage />} />
      <Route path="/movies/:catalogId" element={<MovieDetailsPage />} />
      <Route path="/people/:catalogId" element={<PersonPage />} />
      <Route path="/random" element={<RandomMoviePage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/rooms/new" element={isPagesPreview ? <RoomsPreviewPage /> : <CreateRoomPage />} />
      <Route path="/rooms/:roomId" element={isPagesPreview ? <RoomsPreviewPage /> : <RoomPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes></Suspense></div>
}
