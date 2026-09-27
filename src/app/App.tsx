import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { HomePage } from '../pages/HomePage'
import { CreateRoomPage } from '../pages/CreateRoomPage'
import { RoomPage } from '../pages/RoomPage'

const queryClient = new QueryClient()

export function App() {
  return (
    <BrowserRouter><QueryClientProvider client={queryClient}><Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/rooms/new" element={<CreateRoomPage />} />
      <Route path="/rooms/:roomId" element={<RoomPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes></QueryClientProvider></BrowserRouter>
  )
}
