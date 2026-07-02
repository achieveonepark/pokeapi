import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { idFromUrl, officialArtworkUrl } from "../api/client";
import { describeEvolution } from "../api/evolutionText";
import { localizedName } from "../api/textUtils";
import type { ChainLink } from "../api/types";
import { usePokemonSpecies } from "../hooks/usePokemon";

function flatten(
  link: ChainLink,
  t: ReturnType<typeof useTranslation>["t"],
): { species: ChainLink["species"]; via: string | null }[][] {
  const stages: { species: ChainLink["species"]; via: string | null }[][] = [
    [{ species: link.species, via: null }],
  ];
  let current = link.evolves_to;
  while (current.length > 0) {
    stages.push(
      current.map((c) => ({
        species: c.species,
        via: c.evolution_details[0] ? describeEvolution(c.evolution_details[0], t) : null,
      })),
    );
    current = current.flatMap((c) => c.evolves_to);
  }
  return stages;
}

function EvolutionNode({
  species,
  via,
}: {
  species: ChainLink["species"];
  via: string | null;
}) {
  const { i18n } = useTranslation();
  const { data: speciesData } = usePokemonSpecies(species.name);
  const id = idFromUrl(species.url);
  const displayName = speciesData
    ? localizedName(speciesData.names, i18n.resolvedLanguage ?? "en", species.name)
    : species.name.replace(/-/g, " ");

  return (
    <div className="evolution-node">
      {via && <span className="evolution-condition">{via}</span>}
      <Link to={`/pokemon/${species.name}`} className="evolution-link">
        <img src={officialArtworkUrl(id)} alt={species.name} loading="lazy" />
        <span>{displayName}</span>
      </Link>
    </div>
  );
}

export function EvolutionChain({ chain }: { chain: ChainLink }) {
  const { t } = useTranslation();
  const stages = flatten(chain, t);

  return (
    <div className="evolution-chain">
      {stages.map((stage, i) => (
        <div className="evolution-stage-group" key={i}>
          {i > 0 && <span className="evolution-arrow">→</span>}
          <div className="evolution-stage">
            {stage.map(({ species, via }) => (
              <EvolutionNode key={species.name} species={species} via={via} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
