import { useTranslation } from "react-i18next";
import { HashRouter, NavLink, Route, Routes } from "react-router-dom";
import { LanguageSwitcher } from "./components/LanguageSwitcher";
import { BattlePage } from "./pages/BattlePage";
import { DetailPage } from "./pages/DetailPage";
import { ListPage } from "./pages/ListPage";
import "./App.css";

function App() {
  const { t } = useTranslation();

  return (
    <HashRouter>
      <div className="app-shell">
        <header className="app-title-bar">
          <div className="app-title-group">
            <h1>{t("app.title")}</h1>
            <nav className="app-nav">
              <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
                {t("nav.pokedex")}
              </NavLink>
              <NavLink to="/battle" className={({ isActive }) => (isActive ? "active" : "")}>
                {t("nav.battle")}
              </NavLink>
            </nav>
          </div>
          <LanguageSwitcher />
        </header>
        <Routes>
          <Route path="/" element={<ListPage />} />
          <Route path="/pokemon/:name" element={<DetailPage />} />
          <Route path="/battle" element={<BattlePage />} />
        </Routes>
      </div>
    </HashRouter>
  );
}

export default App;
