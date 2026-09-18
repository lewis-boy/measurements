import "./App.css"
import Home from "./pages/Home.jsx"
import Auth from "./pages/Auth.jsx"
import Checkout from "./pages/Checkout.jsx"
import Navbar from "./components/Navbar.jsx"
import { Routes, Route } from "react-router-dom"

function App() {
  return (
    <div className="app">
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={<Home />}
        />
        <Route
          path="/auth"
          element={<Auth />}
        />
        <Route
          path="/checkout"
          element={<Checkout />}
        />
      </Routes>
    </div>
  )
}

export default App
