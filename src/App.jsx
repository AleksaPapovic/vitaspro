import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Admin from './pages/Admin'
import ProductDetail from './pages/ProductDetail'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/product/:id" element={<ProductDetail />} />
    </Routes>
  )
}

export default App
