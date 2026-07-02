import { useState } from "react";
import { useTranslation } from "react-i18next";
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
import { localizedFlavorText, localizedGenus, localizedName } from "../api/textUtils";

export function DetailPage() {
  const { name } = useParams<{ name: string }>();
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage ?? "en";
  const [showShiny, setShowShiny] = useState(false);

  const { data: pokemon, isLoading, error } = usePokemonDetail(name ?? null);
  const { data: species } = usePokemonSpecies(name ?? null);
  const { data: evoChain } = useEvolutionChain(
    species?.evolution_chain.url ?? null,
  );

  if (isLoading) return <div className="center-message">{t("common.loading")}</div>;
  if (error || !pokemon)
    return (
      <div className="center-message error">
        {t("detail.notFound")} <Link to="/">{t("detail.backToList")}</Link>
      </div>
    );

  const artwork = showShiny
    ? pokemon.sprites.other?.["official-artwork"]?.front_shiny ??
      pokemon.sprites.front_shiny
    : pokemon.sprites.other?.["official-artwork"]?.front_default ??
      pokemon.sprites.front_default;

  const flavorText = species ? localizedFlavorText(species.flavor_text_entries, lang) : null;
  const genus = species ? localizedGenus(species.genera, lang) : null;
  const displayName = species
    ? localizedName(species.names, lang, pokemon.name)
    : pokemon.name.replace(/-/g, " ");

  return (
    <div className="detail-page">
      <Link to="/" className="back-link">
        {t("detail.backLink")}
      </Link>

      <header className="detail-header">
        <div className="detail-artwork-wrap">
          <img src={artwork ?? undefined} alt={pokemon.name} className="detail-artwork" />
          <button className="shiny-toggle" onClick={() => setShowShiny((s) => !s)}>
            {showShiny ? t("detail.shiny") : t("detail.normal")}
          </button>
        </div>
        <div className="detail-heading">
          <span className="detail-id">#{String(pokemon.id).padStart(4, "0")}</span>
          <h1>{displayName}</h1>
          {genus && <p className="detail-genus">{genus}</p>}
          <div className="detail-types">
            {pokemon.types.map((pt) => (
              <TypeBadge key={pt.type.name} name={pt.type.name} />
            ))}
          </div>
          <div className="detail-tags">
            {species?.is_legendary && <span className="tag legendary">{t("detail.legendary")}</span>}
            {species?.is_mythical && <span className="tag mythical">{t("detail.mythical")}</span>}
            {species?.is_baby && <span className="tag baby">{t("detail.baby")}</span>}
          </div>
          {flavorText && <p className="flavor-text">{flavorText}</p>}
        </div>
      </header>

      <section className="detail-grid">
        <div className="panel">
          <h2>{t("detail.panels.physical")}</h2>
          <dl className="stat-list">
            <dt>{t("detail.fields.height")}</dt>
            <dd>{(pokemon.height / 10).toFixed(1)} m</dd>
            <dt>{t("detail.fields.weight")}</dt>
            <dd>{(pokemon.weight / 10).toFixed(1)} kg</dd>
            <dt>{t("detail.fields.baseExperience")}</dt>
            <dd>{pokemon.base_experience ?? "—"}</dd>
            {species && (
              <>
                <dt>{t("detail.fields.shape")}</dt>
                <dd>
                  {species.shape
                    ? t(`shape.${species.shape.name}`, { defaultValue: species.shape.name })
                    : "—"}
                </dd>
                <dt>{t("detail.fields.color")}</dt>
                <dd>{t(`color.${species.color.name}`, { defaultValue: species.color.name })}</dd>
                <dt>{t("detail.fields.habitat")}</dt>
                <dd>
                  {species.habitat
                    ? t(`habitat.${species.habitat.name}`, { defaultValue: species.habitat.name })
                    : "—"}
                </dd>
              </>
            )}
          </dl>
        </div>

        <div className="panel">
          <h2>{t("detail.panels.abilities")}</h2>
          <ul className="abilities-list">
            {pokemon.abilities.map((a) => (
              <li key={a.ability.name}>
                {a.ability.name.replace(/-/g, " ")}
                {a.is_hidden && <span className="hidden-tag">{t("detail.hidden")}</span>}
              </li>
            ))}
          </ul>

          {species && (
            <>
              <h2>{t("detail.panels.breeding")}</h2>
              <dl className="stat-list">
                <dt>{t("detail.fields.captureRate")}</dt>
                <dd>{species.capture_rate} / 255</dd>
                <dt>{t("detail.fields.baseHappiness")}</dt>
                <dd>{species.base_happiness}</dd>
                <dt>{t("detail.fields.growthRate")}</dt>
                <dd>
                  {t(`growthRate.${species.growth_rate.name}`, {
                    defaultValue: species.growth_rate.name,
                  })}
                </dd>
                <dt>{t("detail.fields.eggGroups")}</dt>
                <dd>
                  {species.egg_groups.length
                    ? species.egg_groups
                        .map((g) => t(`eggGroup.${g.name}`, { defaultValue: g.name }))
                        .join(", ")
                    : "—"}
                </dd>
                <dt>{t("detail.fields.hatchSteps")}</dt>
                <dd>{(species.hatch_counter + 1) * 255}</dd>
                <dt>{t("detail.fields.genderRatio")}</dt>
                <dd>
                  {species.gender_rate < 0
                    ? t("detail.genderless")
                    : `♀ ${(species.gender_rate / 8) * 100}% / ♂ ${
                        100 - (species.gender_rate / 8) * 100
                      }%`}
                </dd>
                <dt>{t("detail.fields.generation")}</dt>
                <dd>{species.generation.name.replace("generation-", "").toUpperCase()}</dd>
              </dl>
            </>
          )}
        </div>

        <div className="panel">
          <h2>{t("detail.panels.baseStats")}</h2>
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
          <h2>{t("detail.panels.evolutionChain")}</h2>
          <EvolutionChain chain={evoChain.chain} />
        </section>
      )}

      {species && species.varieties.length > 1 && (
        <section className="panel">
          <h2>{t("detail.panels.forms")}</h2>
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
        <h2>{t("detail.panels.moves")}</h2>
        <MovesList moves={pokemon.moves} />
      </section>

      {pokemon.cries?.latest && (
        <section className="panel">
          <h2>{t("detail.panels.cry")}</h2>
          <audio controls src={pokemon.cries.latest} />
        </section>
      )}
    </div>
  );
}
