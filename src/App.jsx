import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Admin from './pages/Admin'
import ProductDetail from './pages/ProductDetail'
import Partnership from './pages/Partnership'
import Obuke from './pages/Obuke'
import Edukacije from './pages/Edukacije'
import './App.css'

function App() {
  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/partnership" element={<Partnership />} />
        <Route path="/obuke" element={<Obuke />} />
        <Route path="/edukacije" element={<Edukacije />} />
      </Routes>
  )
}

export default App
