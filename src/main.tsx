import {
  StrictMode,
  useCallback,
  useEffect,
  useState,
  type KeyboardEvent,
} from "react";
import { createRoot } from "react-dom/client";
import { convertItem } from "./lib/convert";
import type { ModifierRule } from "./lib/types";
import "./App.css";

function App() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [unmatched, setUnmatched] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [rules, setRules] = useState<ModifierRule[]>([]);
  const [copyLabel, setCopyLabel] = useState("Copy output");

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}modifiers.json`)
      .then((res) => res.json())
      .then((data: ModifierRule[]) => setRules(data));
  }, []);

  const canCopy = Boolean(output) && !error && unmatched.length === 0;

  const runConvert = useCallback(() => {
    if (!rules.length) {
      setOutput("Loading modifier rules…");
      setUnmatched([]);
      setError("");
      return;
    }

    const text = input.trim();
    if (!text) {
      setOutput("");
      setUnmatched([]);
      setError("");
      return;
    }

    const result = convertItem(text, rules);
    setOutput(result.text);
    setUnmatched(result.unmatched);
    setError(result.error ?? "");
  }, [input, rules]);

  const handleCopy = async () => {
    if (!canCopy) return;
    await navigator.clipboard.writeText(output);
    setCopyLabel("Copied!");
    setTimeout(() => setCopyLabel("Copy output"), 1500);
  };

  const handleInputKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey && e.key === "Enter") {
      e.preventDefault();
      runConvert();
    }
  };

  return (
    <div className="wrap">
      <h1>POE2 Fists of Stone Converter</h1>
      <p className="subtitle">
        Paste glove item text from the POE2 trade site or in-game (Ctrl+C), convert,
        then copy into Path of Building. Ctrl+Enter to convert.
      </p>

      <p className="notice">
        Only rare gloves are supported — not uniques, magic, or normal items.
        When a Fists modifier has a range like (21–23)%, the output uses the
        lowest roll — PoB may interpret ranges differently on your end.
      </p>

      <div className="grid">
        <div>
          <label htmlFor="input">Glove item (trade site or in-game)</label>
          <textarea
            id="input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Paste gloves from POE2 trade search or in-game copy…"
            autoFocus
          />
        </div>
        <div>
          <label htmlFor="output">Fists of Stone output</label>
          <textarea
            id="output"
            value={output}
            readOnly
            placeholder="Converted item…"
          />
        </div>
      </div>

      <div className="actions">
        <button id="convert" type="button" onClick={runConvert}>
          Convert
        </button>
        <button id="copy" type="button" onClick={handleCopy} disabled={!canCopy}>
          {copyLabel}
        </button>
      </div>

      {error && (
        <div id="errors" role="alert">
          <strong>Cannot convert</strong>
          <p>{error}</p>
        </div>
      )}

      {unmatched.length > 0 && (
        <div id="warnings">
          <strong>Unmatched modifiers</strong>
          <p className="warn-detail">
            Fix or remove these before copying — they are omitted from the output
            so Path of Building is not given invalid lines.
          </p>
          <ul>
            {unmatched.map((mod, i) => (
              <li key={`${i}-${mod}`}>{mod}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
