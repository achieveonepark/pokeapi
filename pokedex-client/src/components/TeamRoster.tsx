import { useTranslation } from "react-i18next";
import { officialArtworkUrl } from "../api/client";
import { localizedName } from "../api/textUtils";
import { usePokemonDetail, usePokemonSpecies } from "../hooks/usePokemon";
import type { OwnedPokemon } from "../team/types";
import { MAX_TEAM_SIZE } from "../team/growth";

function TeamMemberCard({
  member,
  isActive,
  onSelect,
  disabled,
}: {
  member: OwnedPokemon;
  isActive: boolean;
  onSelect: () => void;
  disabled: boolean;
}) {
  const { i18n } = useTranslation();
  const lang = i18n.resolvedLanguage ?? "en";
  const { data: pokemon } = usePokemonDetail(member.slug);
  const { data: species } = usePokemonSpecies(member.slug);

  const id = pokemon ? pokemon.id : 0;
  const artwork =
    pokemon?.sprites.other?.["official-artwork"]?.front_default ??
    pokemon?.sprites.front_default ??
    (id ? officialArtworkUrl(id) : undefined);
  const displayName = species ? localizedName(species.names, lang, member.slug) : member.slug;

  return (
    <button
      type="button"
      className={`team-member ${isActive ? "active" : ""}`}
      onClick={onSelect}
      disabled={disabled}
    >
      <span className="team-member-level">Lv.{member.level}</span>
      {artwork && <img src={artwork} alt={displayName} className="team-member-sprite" />}
      <span className="team-member-name">{displayName}</span>
    </button>
  );
}

export function TeamRoster({
  team,
  activeIndex,
  onSelect,
  disabled,
}: {
  team: OwnedPokemon[];
  activeIndex: number;
  onSelect: (index: number) => void;
  disabled: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className="team-roster">
      <h3 className="team-roster-title">
        {t("battle.myTeam")} ({team.length}/{MAX_TEAM_SIZE})
      </h3>
      <div className="team-roster-grid">
        {team.map((member, i) => (
          <TeamMemberCard
            key={`${member.slug}-${i}`}
            member={member}
            isActive={i === activeIndex}
            onSelect={() => onSelect(i)}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
}

