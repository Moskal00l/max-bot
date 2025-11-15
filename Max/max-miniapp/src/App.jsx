import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Home } from "./panels/Home/Home.jsx";
import { CreatePanel } from "./panels/CreatePanel/CreatePanel.jsx";
import { EventPanel } from "./panels/EventPanel/EventPanel.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreatePanel />} />
        <Route path="/event" element={<EventPanel />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
