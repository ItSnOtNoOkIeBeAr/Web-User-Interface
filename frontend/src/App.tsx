import { Route, Routes } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import LiveCameraPage from './pages/LiveCameraPage'
import Lab1Page from './pages/labs/Lab1Page'
import Lab2Page from './pages/labs/Lab2Page'
import Lab3Page from './pages/labs/Lab3Page'
import Lab4Page from './pages/labs/Lab4Page'
import Lab5Page from './pages/labs/Lab5Page'
import Lab6Page from './pages/labs/Lab6Page'
import Lab7Page from './pages/labs/Lab7Page'

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="lab1" element={<Lab1Page />} />
        <Route path="lab2" element={<Lab2Page />} />
        <Route path="lab3" element={<Lab3Page />} />
        <Route path="lab4" element={<Lab4Page />} />
        <Route path="lab5" element={<Lab5Page />} />
        <Route path="lab6" element={<Lab6Page />} />
        <Route path="lab7" element={<Lab7Page />} />
        <Route path="live" element={<LiveCameraPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="*" element={<HomePage />} />
      </Route>
    </Routes>
  )
}
