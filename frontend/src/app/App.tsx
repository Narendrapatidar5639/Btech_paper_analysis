import { Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { SelectionPage } from "./pages/SelectionPage";
import { PapersPage } from "./pages/PapersPage";
// 1. IMPORT YOUR DASHBOARD PAGE HERE
import { AnalysisDashboard } from "./pages/AnalysisDashboard"; 
import { NotFound } from "./pages/NotFound"; // Your 404 component

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} /> 
      <Route path="/selection" element={<SelectionPage />} />
      <Route path="/papers" element={<PapersPage />} />
      
      {/* 2. ADD THIS EXACT LINE */}
      <Route path="/dashboard" element={<AnalysisDashboard />} />

      {/* This catch-all shows the 404 page for anything else */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;