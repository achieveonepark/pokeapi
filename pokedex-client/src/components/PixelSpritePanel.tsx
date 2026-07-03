import { useState } from "react";
import { useTranslation } from "react-i18next";
import { PmdSprite, type PmdAnimName } from "./PmdSprite";
import { usePmdAnimData } from "../hooks/usePmdAnimData";
import { pmdPortraitUrl, dexIdToPmdId } from "../pmd/urls";

const ANIM_ORDER: PmdAnimName[] = ["Idle", "Walk", "Attack", "Hurt", "Sleep", "Faint"];

export function PixelSpritePanel({ dexId }: { dexId: number }) {
  const { t } = useTranslation();
  const { data: animData, isLoading, isError } = usePmdAnimData(dexId);
  const [anim, setAnim] = useState<PmdAnimName>("Idle");
  const [portraitOk, setPortraitOk] = useState(true);

  if (isLoading) return null;
  if (isError || !animData || !animData.Idle) return null;

  const availableAnims = ANIM_ORDER.filter((name) => animData[name]);

  return (
    <div className="panel pixel-sprite-panel">
      <h2>{t("detail.panels.pixelSprite")}</h2>
      <div className="pixel-sprite-body">
        {portraitOk && (
          <img
            src={pmdPortraitUrl(dexIdToPmdId(dexId))}
            alt=""
            className="pmd-portrait"
            onError={() => setPortraitOk(false)}
          />
        )}
        <div className="pixel-sprite-stage">
          <PmdSprite dexId={dexId} anim={anim} scale={4} maxSize={140} />
        </div>
      </div>
      <div className="pixel-anim-tabs">
        {availableAnims.map((name) => (
          <button
            key={name}
            className={`pixel-anim-tab ${anim === name ? "active" : ""}`}
            onClick={() => setAnim(name)}
          >
            {t(`pmdAnim.${name}`, { defaultValue: name })}
          </button>
        ))}
      </div>
      <p className="pixel-sprite-credit">
        {t("detail.pixelSpriteCredit")}{" "}
        <a href="https://github.com/PMDCollab/SpriteCollab" target="_blank" rel="noreferrer">
          PMDCollab/SpriteCollab
        </a>{" "}
        (CC BY-NC 4.0)
      </p>
    </div>
  );
}
