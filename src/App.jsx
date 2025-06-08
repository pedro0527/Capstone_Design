import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Face } from "./pages/Face";
import { Arm } from "./pages/Arm";
import { Result } from "./pages/Result";
import Home from "./pages/Home";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/face" element={<Face />} />
        <Route path="/arm" element={<Arm />} />
        <Route path="/result" element={<Result />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
