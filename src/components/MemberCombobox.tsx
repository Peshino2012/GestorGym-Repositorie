"use client";

import { useEffect, useRef, useState } from "react";

type Member = { id: string; name: string; dni?: string | null };

export default function MemberCombobox({
  members,
  name,
  id,
  defaultValue = "",
  placeholder = "Buscar socio por nombre...",
  required = false,
  onSelect,
  suffixFor,
}: {
  members: Member[];
  name: string;
  id?: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  onSelect?: (memberId: string) => void;
  /** Optional extra text appended after a member's name in the dropdown, e.g. a warning badge. */
  suffixFor?: (memberId: string) => string;
}) {
  const defaultMember = members.find((m) => m.id === defaultValue);
  const [query, setQuery] = useState(defaultMember?.name ?? "");
  const [selectedId, setSelectedId] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = query.trim()
    ? members.filter((m) => {
        const q = query.trim().toLowerCase();
        return m.name.toLowerCase().includes(q) || m.dni?.toLowerCase().includes(q);
      })
    : members;

  function select(m: Member) {
    setSelectedId(m.id);
    setQuery(m.name);
    setOpen(false);
    onSelect?.(m.id);
  }

  function clear() {
    setSelectedId("");
    setQuery("");
    onSelect?.("");
  }

  return (
    <div ref={containerRef} className="relative">
      <input type="hidden" name={name} value={selectedId} />
      <input
        type="text"
        id={id}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          if (selectedId) setSelectedId("");
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        autoComplete="off"
        required={required}
        className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
      {query && (
        <button
          type="button"
          onClick={clear}
          aria-label="Limpiar"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
        >
          ✕
        </button>
      )}
      {open && (
        <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-border bg-surface shadow-lg">
          {filtered.length > 0 ? (
            filtered.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => select(m)}
                  className="block w-full px-3.5 py-2 text-left text-sm hover:bg-background"
                >
                  {m.name}
                  {m.dni ? ` — DNI ${m.dni}` : ""}
                  {suffixFor?.(m.id)}
                </button>
              </li>
            ))
          ) : (
            <li className="px-3.5 py-2 text-sm text-muted-foreground">Sin resultados.</li>
          )}
        </ul>
      )}
    </div>
  );
}
