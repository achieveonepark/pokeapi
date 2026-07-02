import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { PokemonCard } from "./PokemonCard";
import { usePokemonIndex } from "../hooks/usePokemon";

const PAGE_SIZE = 24;

export function StarterPicker({ onPick }: { onPick: (name: string) => void }) {
  const { t } = useTranslation();
  const { data: index, isLoading, error } = usePokemonIndex();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    if (!index) return [];
    const term = search.trim().toLowerCase();
    if (!term) return index.results;
    return index.results.filter(
      (p) => p.name.includes(term) || p.url.match(/\/(\d+)\/$/)?.[1] === term,
    );
  }, [index, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const pageItems = filtered.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE);

  if (isLoading) return <div className="center-message">{t("list.loadingPokedex")}</div>;
  if (error) return <div className="center-message error">{t("list.error")}</div>;

  return (
    <div className="starter-picker">
      <h2 className="starter-picker-title">{t("battle.chooseStarter")}</h2>
      <div className="toolbar">
        <input
          type="text"
          placeholder={t("list.searchPlaceholder")}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          className="search-input"
        />
      </div>
      <div className="pokemon-grid">
        {pageItems.map((p) => (
          <PokemonCard key={p.name} name={p.name} url={p.url} onSelect={onPick} />
        ))}
      </div>
      <div className="pagination">
        <button disabled={currentPage === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
          {t("list.prev")}
        </button>
        <span>{t("list.page", { current: currentPage + 1, total: pageCount })}</span>
        <button
          disabled={currentPage >= pageCount - 1}
          onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
        >
          {t("list.next")}
        </button>
      </div>
    </div>
  );
}
