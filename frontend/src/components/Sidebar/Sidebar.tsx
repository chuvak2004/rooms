import s from "./Sidebar.module.css";
import { SECTIONS } from "./sidebar.config";
import { brand } from "@/theme";
import { useAuth } from "@/context/auth";

export function Sidebar({ active, onChange }: { active: string; onChange: (id: string) => void }) {
  const { user } = useAuth();

  const mark = (name?: string) => {
    if (!name) return "A";
    const parts = name.trim().split(/\s+/);
    return (parts[0]?.[0] ?? "").concat(parts[1]?.[0] ?? "").toUpperCase();
  };

  return (
    <aside className={s.aside}>
      <div className={s.logo}>
        <span className={s.mark}>A</span>
        <div>
          <div className={s.title}>{brand.name}</div>
          <div className={s.tag}>{brand.tagline}</div>
        </div>
      </div>

      <nav className={s.nav}>
        {SECTIONS.map((item) => {
          const isActive = item.id === active;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              className={isActive ? `${s.link} ${s.linkActive}` : s.link}
              onClick={() => onChange(item.id)}
            >
              <Icon className={s.linkIcon} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className={s.footer}>
        <div className={s.avatar}>{mark(user?.name)}</div>
        <div className={s.who}>
          <div className={s.whoName}>{user?.name ?? "Оператор"}</div>
          <div className={s.whoRole}>В сети</div>
        </div>
      </div>
    </aside>
  );
}
