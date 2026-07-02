import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { idFromUrl, officialArtworkUrl } from "../api/client";
import { localizedName } from "../api/textUtils";
import { usePokemonDetail, usePokemonSpecies } from "../hooks/usePokemon";
import { TypeBadge } from "./TypeBadge";

export function PokemonCard({
  name,
  url,
  onSelect,
}: {
  name: string;
  url: string;
  /** When provided, the card becomes a selectable button instead of a link to the detail page. */
  onSelect?: (name: string) => void;
}) {
  const { i18n } = useTranslation();
  const id = idFromUrl(url);
  const { data, isLoading } = usePokemonDetail(name);
  const { data: species } = usePokemonSpecies(name);

  const artwork =
    data?.sprites.other?.["official-artwork"]?.front_default ??
    data?.sprites.front_default ??
    officialArtworkUrl(id);

  const displayName = species
    ? localizedName(species.names, i18n.resolvedLanguage ?? "en", name)
    : name.replace(/-/g, " ");

  const content = (
    <>
      <span className="pokemon-card-id">#{String(id).padStart(4, "0")}</span>
      <img src={artwork} alt={name} loading="lazy" className="pokemon-card-sprite" />
      <span className="pokemon-card-name">{displayName}</span>
      <span className="pokemon-card-types">
        {isLoading && <span className="skeleton-badge" />}
        {data?.types.map((t) => (
          <TypeBadge key={t.type.name} name={t.type.name} />
        ))}
      </span>
    </>
  );

  if (onSelect) {
    return (
      <button type="button" className="pokemon-card pokemon-card-button" onClick={() => onSelect(name)}>
        {content}
      </button>
    );
  }

  return (
    <Link to={`/pokemon/${name}`} className="pokemon-card">
      {content}
    </Link>
  );
}
