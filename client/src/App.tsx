import * as React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SchedulePage } from '@/pages/schedule/SchedulePage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<SchedulePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;