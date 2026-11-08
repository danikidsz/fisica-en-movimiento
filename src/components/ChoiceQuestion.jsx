import { useEffect, useState } from 'react';
import { CircleCheck, CircleX, Lightbulb } from 'lucide-react';

/**
 * Pregunta de selección única con reintento.
 * Un error no bloquea: muestra una pista y deja intentar de nuevo.
 * renderOption permite dibujar opciones gráficas (p. ej. gráficas).
 */
export default function ChoiceQuestion({
  id,
  question,
  options,
  correct,
  hint,
  explanation,
  solved,
  onSolved,
  renderOption,
  layout = 'list',
}) {
  const [wrong, setWrong] = useState([]);
  const [done, setDone] = useState(Boolean(solved));

  useEffect(() => {
    setWrong([]);
    setDone(Boolean(solved));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const pick = (i) => {
    if (done || wrong.includes(i)) return;
    if (i === correct) {
      setDone(true);
      onSolved?.({ firstTry: wrong.length === 0, mistakes: wrong.length });
    } else {
      setWrong((w) => [...w, i]);
    }
  };

  const status = done ? 'ok' : wrong.length ? 'retry' : 'idle';

  return (
    <fieldset className="choice">
      <legend className="choice__q">{question}</legend>
      <div className={`choice__opts choice__opts--${layout}`}>
        {options.map((opt, i) => {
          const isRight = done && i === correct;
          const isWrong = wrong.includes(i);
          return (
            <button
              key={i}
              type="button"
              className={`choice__opt ${isRight ? 'is-right' : ''} ${isWrong ? 'is-wrong' : ''}`}
              onClick={() => pick(i)}
              aria-pressed={isRight || isWrong}
              aria-disabled={done || isWrong}
              aria-label={typeof opt === 'string' ? undefined : `Opción ${String.fromCharCode(65 + i)}`}
            >
              <span className="choice__key" aria-hidden="true">
                {isRight ? <CircleCheck /> : isWrong ? <CircleX /> : String.fromCharCode(65 + i)}
              </span>
              <span className="choice__label">{renderOption ? renderOption(opt, i) : opt}</span>
              {isWrong && <span className="sr-only">(incorrecta)</span>}
              {isRight && <span className="sr-only">(correcta)</span>}
            </button>
          );
        })}
      </div>

      <div className={`feedback feedback--${status}`} aria-live="polite">
        {status === 'retry' && (
          <>
            <Lightbulb aria-hidden="true" />
            <p>
              <strong>Todavía no. </strong>
              {hint}
            </p>
          </>
        )}
        {status === 'ok' && (
          <>
            <CircleCheck aria-hidden="true" />
            <p>
              <strong>{wrong.length === 0 && !solved ? '¡Exacto! ' : 'Correcto. '}</strong>
              {explanation}
            </p>
          </>
        )}
      </div>
    </fieldset>
  );
}
