import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { EvolutionChain } from "../components/EvolutionChain";
import { MovesList } from "../components/MovesList";
import { StatBar } from "../components/StatBar";
import { TypeBadge } from "../components/TypeBadge";
import {
  useEvolutionChain,
  usePokemonDetail,
  usePokemonSpecies,
} from "../hooks/usePokemon";
import { englishFlavorText, englishGenus } from "../api/textUtils";

export function DetailPage() {
  const { name } = useParams<{ name: string }>();
  const [showShiny, setShowShiny] = useState(false);

  const { data: pokemon, isLoading, error } = usePokemonDetail(name ?? null);
  const { data: species } = usePokemonSpecies(name ?? null);
  const { data: evoChain } = useEvolutionChain(
    species?.evolution_chain.url ?? null,
  );

  if (isLoading) return <div className="center-message">Loading…</div>;
  if (error || !pokemon)
    return (
      <div className="center-message error">
        Couldn't load that Pokemon.{" "}
        <Link to="/">Back to list</Link>
      </div>
    );

  const artwork = showShiny
    ? pokemon.sprites.other?.["official-artwork"]?.front_shiny ??
      pokemon.sprites.front_shiny
    : pokemon.sprites.other?.["official-artwork"]?.front_default ??
      pokemon.sprites.front_default;

  const flavorText = species ? englishFlavorText(species.flavor_text_entries) : null;
  const genus = species ? englishGenus(species.genera) : null;

  return (
    <div className="detail-page">
      <Link to="/" className="back-link">
        ‹ Back to Pokedex
      </Link>

      <header className="detail-header">
        <div className="detail-artwork-wrap">
          <img src={artwork ?? undefined} alt={pokemon.name} className="detail-artwork" />
          <button className="shiny-toggle" onClick={() => setShowShiny((s) => !s)}>
            {showShiny ? "★ Shiny" : "☆ Normal"}
          </button>
        </div>
        <div className="detail-heading">
          <span className="detail-id">#{String(pokemon.id).padStart(4, "0")}</span>
          <h1>{pokemon.name.replace(/-/g, " ")}</h1>
          {genus && <p className="detail-genus">{genus}</p>}
          <div className="detail-types">
            {pokemon.types.map((t) => (
              <TypeBadge key={t.type.name} name={t.type.name} />
            ))}
          </div>
          <div className="detail-tags">
            {species?.is_legendary && <span className="tag legendary">Legendary</span>}
            {species?.is_mythical && <span className="tag mythical">Mythical</span>}
            {species?.is_baby && <span className="tag baby">Baby</span>}
          </div>
          {flavorText && <p className="flavor-text">{flavorText}</p>}
        </div>
      </header>

      <section className="detail-grid">
        <div className="panel">
          <h2>Physical</h2>
          <dl className="stat-list">
            <dt>Height</dt>
            <dd>{(pokemon.height / 10).toFixed(1)} m</dd>
            <dt>Weight</dt>
            <dd>{(pokemon.weight / 10).toFixed(1)} kg</dd>
            <dt>Base Experience</dt>
            <dd>{pokemon.base_experience ?? "—"}</dd>
            {species && (
              <>
                <dt>Shape</dt>
                <dd>{species.shape?.name ?? "—"}</dd>
                <dt>Color</dt>
                <dd>{species.color.name}</dd>
                <dt>Habitat</dt>
                <dd>{species.habitat?.name ?? "—"}</dd>
              </>
            )}
          </dl>
        </div>

        <div className="panel">
          <h2>Abilities</h2>
          <ul className="abilities-list">
            {pokemon.abilities.map((a) => (
              <li key={a.ability.name}>
                {a.ability.name.replace(/-/g, " ")}
                {a.is_hidden && <span className="hidden-tag">hidden</span>}
              </li>
            ))}
          </ul>

          {species && (
            <>
              <h2>Breeding &amp; Training</h2>
              <dl className="stat-list">
                <dt>Capture Rate</dt>
                <dd>{species.capture_rate} / 255</dd>
                <dt>Base Happiness</dt>
                <dd>{species.base_happiness}</dd>
                <dt>Growth Rate</dt>
                <dd>{species.growth_rate.name.replace(/-/g, " ")}</dd>
                <dt>Egg Groups</dt>
                <dd>
                  {species.egg_groups.length
                    ? species.egg_groups.map((g) => g.name).join(", ")
                    : "—"}
                </dd>
                <dt>Hatch Steps</dt>
                <dd>{(species.hatch_counter + 1) * 255}</dd>
                <dt>Gender Ratio</dt>
                <dd>
                  {species.gender_rate < 0
                    ? "Genderless"
                    : `♀ ${(species.gender_rate / 8) * 100}% / ♂ ${
                        100 - (species.gender_rate / 8) * 100
                      }%`}
                </dd>
                <dt>Generation</dt>
                <dd>{species.generation.name.replace("generation-", "").toUpperCase()}</dd>
              </dl>
            </>
          )}
        </div>

        <div className="panel">
          <h2>Base Stats</h2>
          {pokemon.stats.map((s) => (
            <StatBar key={s.stat.name} statName={s.stat.name} value={s.base_stat} />
          ))}
          <StatBar
            statName="total"
            value={pokemon.stats.reduce((sum, s) => sum + s.base_stat, 0)}
          />
        </div>
      </section>

      {evoChain && (
        <section className="panel">
          <h2>Evolution Chain</h2>
          <EvolutionChain chain={evoChain.chain} />
        </section>
      )}

      {species && species.varieties.length > 1 && (
        <section className="panel">
          <h2>Forms</h2>
          <div className="varieties-list">
            {species.varieties.map((v) => (
              <Link
                key={v.pokemon.name}
                to={`/pokemon/${v.pokemon.name}`}
                className={`variety-link ${v.pokemon.name === pokemon.name ? "active" : ""}`}
              >
                {v.pokemon.name.replace(/-/g, " ")}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="panel">
        <h2>Moves</h2>
        <MovesList moves={pokemon.moves} />
      </section>

      {pokemon.cries?.latest && (
        <section className="panel">
          <h2>Cry</h2>
          <audio controls src={pokemon.cries.latest} />
        </section>
      )}
    </div>
  );
}
