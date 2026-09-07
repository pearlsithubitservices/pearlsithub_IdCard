import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import AdminDashboard from './pages/AdminDashboard'
import EmployeeProfile from './pages/EmployeeProfile'
import AddEmployee from './pages/AddEmployee'
import EditEmployee from './pages/EditEmployee'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/add" element={<AddEmployee />} />
          <Route path="/admin/edit/:id" element={<EditEmployee />} />
          <Route path="/employee/:id" element={<EmployeeProfile />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
