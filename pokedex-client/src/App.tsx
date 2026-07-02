import { useTranslation } from "react-i18next";
import { HashRouter, Route, Routes } from "react-router-dom";
import { LanguageSwitcher } from "./components/LanguageSwitcher";
import { DetailPage } from "./pages/DetailPage";
import { ListPage } from "./pages/ListPage";
import "./App.css";

function App() {
  const { t } = useTranslation();

  return (
    <HashRouter>
      <div className="app-shell">
        <header className="app-title-bar">
          <h1>{t("app.title")}</h1>
          <LanguageSwitcher />
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
