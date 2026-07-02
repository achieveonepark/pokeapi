import { HashRouter, Route, Routes } from "react-router-dom";
import { DetailPage } from "./pages/DetailPage";
import { ListPage } from "./pages/ListPage";
import "./App.css";

function App() {
  return (
    <HashRouter>
      <div className="app-shell">
        <header className="app-title-bar">
          <h1>Pokedex</h1>
        </header>
        <Routes>
          <Route path="/" element={<ListPage />} />
          <Route path="/pokemon/:name" element={<DetailPage />} />
        </Routes>
      </div>
    </HashRouter>
  );
}

export default App;
