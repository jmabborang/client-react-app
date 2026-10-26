import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import views from '../pages/views.jsx'

function AppRoutes() {

  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/" element={<views.TestPage/>} /> */}
        {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
