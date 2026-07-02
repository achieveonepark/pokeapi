import { typeColor } from "../api/typeColors";

export function TypeBadge({ name }: { name: string }) {
  return (
    <span className="type-badge" style={{ backgroundColor: typeColor(name) }}>
      {name}
    </span>
  );
}
