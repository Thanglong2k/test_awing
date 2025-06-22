import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TreasureMapForm from "@/components/TreasureMap";
import MainLayout from "@/layouts/MainLayout";
import './App.css'

function App() {

  return (
    <Router>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<TreasureMapForm />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App
