import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { CHALLENGES, TOTAL_ITEMS } from '../data/challenges.js';

const KEY = 'uao-fisica-movimiento-v1';
const EMPTY = { items: {} };

// localStorage puede estar bloqueado dentro de iframes (Safari, modo privado).
function load() {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed.items === 'object' ? parsed : EMPTY;
  } catch {
    return EMPTY;
  }
}

function save(state) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* sin almacenamiento: el progreso dura mientras la página esté abierta */
  }
}

const ProgressContext = createContext(null);

export function ProgressProvider({ children }) {
  const [state, setState] = useState(load);
  const [version, setVersion] = useState(0);

  useEffect(() => save(state), [state]);

  // Registra un ítem resuelto. No sobrescribe uno ya registrado.
  const record = useCallback((id, { points, firstTry }) => {
    setState((s) => (s.items[id] ? s : { items: { ...s.items, [id]: { points, firstTry } } }));
  }, []);

  const reset = useCallback(() => {
    setState(EMPTY);
    setVersion((v) => v + 1);
  }, []);

  const summary = useMemo(() => {
    const entries = Object.values(state.items);
    const perChallenge = CHALLENGES.map((c) => {
      const done = c.items.filter((i) => state.items[i]).length;
      return { ...c, done, complete: done === c.items.length };
    });
    return {
      score: entries.reduce((n, e) => n + e.points, 0),
      correct: entries.filter((e) => e.firstTry).length,
      answered: entries.length,
      total: TOTAL_ITEMS,
      completed: perChallenge.filter((c) => c.complete).length,
      perChallenge,
      percent: Math.round((entries.length / TOTAL_ITEMS) * 100),
    };
  }, [state]);

  const value = useMemo(
    () => ({ items: state.items, record, reset, summary, version }),
    [state.items, record, reset, summary, version]
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress debe usarse dentro de ProgressProvider');
  return ctx;
}
