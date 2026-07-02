import { useMemo, useState } from "react";
import { PokemonCard } from "../components/PokemonCard";
import { usePokemonIndex, useTypeDetail, useTypeList } from "../hooks/usePokemon";

const PAGE_SIZE = 24;

export function ListPage() {
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

  if (isLoading) return <div className="center-message">Loading Pokedex…</div>;
  if (error)
    return (
      <div className="center-message error">
        Failed to reach PokeAPI. Check your internet connection.
      </div>
    );

  return (
    <div className="list-page">
      <div className="toolbar">
        <input
          type="text"
          placeholder="Search by name or ID…"
          value={search}
          onChange={(e) => updateSearch(e.target.value)}
          className="search-input"
        />
        <select
          value={selectedType ?? ""}
          onChange={(e) => updateType(e.target.value)}
          className="type-select"
        >
          <option value="">All types</option>
          {typeList?.results
            .filter((t) => !["unknown", "shadow"].includes(t.name))
            .map((t) => (
              <option key={t.name} value={t.name}>
                {t.name}
              </option>
            ))}
        </select>
        <span className="result-count">{filtered.length} found</span>
      </div>

      <div className="pokemon-grid">
        {pageItems.map((p) => (
          <PokemonCard key={p.name} name={p.name} url={p.url} />
        ))}
        {pageItems.length === 0 && (
          <p className="empty-note">No Pokemon match your search.</p>
        )}
      </div>

      <div className="pagination">
        <button disabled={currentPage === 0} onClick={() => setPage(0)}>
          « First
        </button>
        <button
          disabled={currentPage === 0}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
        >
          ‹ Prev
        </button>
        <span>
          Page {currentPage + 1} / {pageCount}
        </span>
        <button
          disabled={currentPage >= pageCount - 1}
          onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
        >
          Next ›
        </button>
        <button
          disabled={currentPage >= pageCount - 1}
          onClick={() => setPage(pageCount - 1)}
        >
          Last »
        </button>
      </div>
    </div>
  );
}
