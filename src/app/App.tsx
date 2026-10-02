import { Suspense, lazy, useLayoutEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { MobileNav } from '../pages/components/MobileNav'
import { TechBackground } from '../pages/components/TechBackground'

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

export function App() {
  return (
    <BrowserRouter><QueryClientProvider client={queryClient}><TechBackground /><AnimatedRoutes /><MobileNav /></QueryClientProvider></BrowserRouter>
  )
}

function AnimatedRoutes() {
  const location = useLocation()
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [location.pathname])
  return <div key={location.pathname} className="page-transition"><Suspense fallback={<div className="min-h-screen p-8 text-sm text-slate-400">Загружаем страницу…</div>}><Routes location={location}>
      <Route path="/" element={<HomePage />} />
      <Route path="/series" element={<SeriesPage />} />
      <Route path="/movies" element={<MoviesPage />} />
      <Route path="/series/:catalogId" element={<SeriesDetailsPage />} />
      <Route path="/movies/:catalogId" element={<MovieDetailsPage />} />
      <Route path="/people/:catalogId" element={<PersonPage />} />
      <Route path="/random" element={<RandomMoviePage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/rooms/new" element={<CreateRoomPage />} />
      <Route path="/rooms/:roomId" element={<RoomPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes></Suspense></div>
}
