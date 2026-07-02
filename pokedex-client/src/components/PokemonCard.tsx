import { Link } from "react-router-dom";
import { idFromUrl, officialArtworkUrl } from "../api/client";
import { usePokemonDetail } from "../hooks/usePokemon";
import { TypeBadge } from "./TypeBadge";

export function PokemonCard({ name, url }: { name: string; url: string }) {
  const id = idFromUrl(url);
  const { data, isLoading } = usePokemonDetail(name);

  const artwork =
    data?.sprites.other?.["official-artwork"]?.front_default ??
    data?.sprites.front_default ??
    officialArtworkUrl(id);

  return (
    <Link to={`/pokemon/${name}`} className="pokemon-card">
      <span className="pokemon-card-id">#{String(id).padStart(4, "0")}</span>
      <img
        src={artwork}
        alt={name}
        loading="lazy"
        className="pokemon-card-sprite"
      />
      <span className="pokemon-card-name">{name.replace(/-/g, " ")}</span>
      <span className="pokemon-card-types">
        {isLoading && <span className="skeleton-badge" />}
        {data?.types.map((t) => (
          <TypeBadge key={t.type.name} name={t.type.name} />
        ))}
      </span>
    </Link>
  );
}
