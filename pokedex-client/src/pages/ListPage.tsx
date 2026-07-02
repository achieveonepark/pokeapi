import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { PokemonCard } from "../components/PokemonCard";
import { usePokemonIndex, useTypeDetail, useTypeList } from "../hooks/usePokemon";

const PAGE_SIZE = 24;

export function ListPage() {
  const { t } = useTranslation();
  const { data: index, isLoading, error } = usePokemonIndex();
  const { data: typeList } = useTypeList();
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const { data: typeDetail } = useTypeDetail(selectedType);

  const typeNames = useMemo(() => {
    if (!selectedType || !typeDetail) return null;
    return new Set(typeDetail.pokemon.map((p) => p.pokemon.name));
  }, [selectedType, typeDetail]);

  const filtered = useMemo(() => {
    if (!index) return [];
    const term = search.trim().toLowerCase();
    return index.results.filter((p) => {
      if (typeNames && !typeNames.has(p.name)) return false;
      if (!term) return true;
      return p.name.includes(term) || p.url.match(/\/(\d+)\/$/)?.[1] === term;
    });
  }, [index, search, typeNames]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const pageItems = filtered.slice(
    currentPage * PAGE_SIZE,
    currentPage * PAGE_SIZE + PAGE_SIZE,
  );

  function updateSearch(value: string) {
    setSearch(value);
    setPage(0);
  }

  function updateType(value: string) {
    setSelectedType(value || null);
    setPage(0);
  }

  if (isLoading) return <div className="center-message">{t("list.loadingPokedex")}</div>;
  if (error) return <div className="center-message error">{t("list.error")}</div>;

  return (
    <div className="list-page">
      <div className="toolbar">
        <input
          type="text"
          placeholder={t("list.searchPlaceholder")}
          value={search}
          onChange={(e) => updateSearch(e.target.value)}
          className="search-input"
        />
        <select
          value={selectedType ?? ""}
          onChange={(e) => updateType(e.target.value)}
          className="type-select"
        >
          <option value="">{t("list.allTypes")}</option>
          {typeList?.results
            .filter((typeItem) => !["unknown", "shadow"].includes(typeItem.name))
            .map((typeItem) => (
              <option key={typeItem.name} value={typeItem.name}>
                {t(`types.${typeItem.name}`, { defaultValue: typeItem.name })}
              </option>
            ))}
        </select>
        <span className="result-count">{t("list.resultCount", { count: filtered.length })}</span>
      </div>

      <div className="pokemon-grid">
        {pageItems.map((p) => (
          <PokemonCard key={p.name} name={p.name} url={p.url} />
        ))}
        {pageItems.length === 0 && <p className="empty-note">{t("list.empty")}</p>}
      </div>

      <div className="pagination">
        <button disabled={currentPage === 0} onClick={() => setPage(0)}>
          {t("list.first")}
        </button>
        <button
          disabled={currentPage === 0}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
        >
          {t("list.prev")}
        </button>
        <span>{t("list.page", { current: currentPage + 1, total: pageCount })}</span>
        <button
          disabled={currentPage >= pageCount - 1}
          onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
        >
          {t("list.next")}
        </button>
        <button
          disabled={currentPage >= pageCount - 1}
          onClick={() => setPage(pageCount - 1)}
        >
          {t("list.last")}
        </button>
      </div>
    </div>
  );
}
