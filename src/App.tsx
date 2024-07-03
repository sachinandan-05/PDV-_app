// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Nav from './Components/Nav';
import Hero from './Components/Hero';
import MapComponent from './Components/Map'; // Import your MapComponent here
import { Toaster } from 'react-hot-toast';



const App: React.FC = () => {
  return (
    <Router>
      <div>
      
      <Toaster/>
        <Nav />
        <Routes>
          <Route path="/" element={<Hero />} />
         
          <Route path="/map" element={<MapComponent />} />
         
        </Routes>
      </div>
    </Router>
  );
};

export default App;
