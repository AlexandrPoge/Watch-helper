import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { HomePage } from '../pages/HomePage'
import { CreateRoomPage } from '../pages/CreateRoomPage'
import { RoomPage } from '../pages/RoomPage'
import { SeriesDetailsPage } from '../pages/SeriesDetailsPage'
import { SeriesPage } from '../pages/SeriesPage'
import { MovieDetailsPage } from '../pages/MovieDetailsPage'
import { PersonPage } from '../pages/PersonPage'
import { ProfilePage } from '../pages/ProfilePage'
import { RandomMoviePage } from '../pages/RandomMoviePage'
import { MobileNav } from '../pages/components/MobileNav'
import { TechBackground } from '../pages/components/TechBackground'

const queryClient = new QueryClient()

export function App() {
  return (
    <BrowserRouter><QueryClientProvider client={queryClient}><TechBackground /><AnimatedRoutes /><MobileNav /></QueryClientProvider></BrowserRouter>
  )
}

function AnimatedRoutes() {
  const location = useLocation()
  return <div key={location.pathname} className="page-transition"><Routes location={location}>
      <Route path="/" element={<HomePage />} />
      <Route path="/series" element={<SeriesPage />} />
      <Route path="/series/:catalogId" element={<SeriesDetailsPage />} />
      <Route path="/movies/:catalogId" element={<MovieDetailsPage />} />
      <Route path="/people/:catalogId" element={<PersonPage />} />
      <Route path="/random" element={<RandomMoviePage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/rooms/new" element={<CreateRoomPage />} />
      <Route path="/rooms/:roomId" element={<RoomPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes></div>
}
