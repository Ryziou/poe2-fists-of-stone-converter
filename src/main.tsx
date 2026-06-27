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
  const [rules, setRules] = useState<ModifierRule[]>([]);
  const [copyLabel, setCopyLabel] = useState("Copy output");

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}modifiers.json`)
      .then((res) => res.json())
      .then((data: ModifierRule[]) => setRules(data));
  }, []);

  const runConvert = useCallback(() => {
    if (!rules.length) {
      setOutput("Loading modifier rules…");
      setUnmatched([]);
      return;
    }

    const text = input.trim();
    if (!text) {
      setOutput("");
      setUnmatched([]);
      return;
    }

    const result = convertItem(text, rules);
    setOutput(result.text);
    setUnmatched(result.unmatched);
  }, [input, rules]);

  const handleCopy = async () => {
    if (!output) return;
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
        Paste trade-site item text, convert, then copy into Path of Building.
        Ctrl+Enter to convert.
      </p>

      <div className="grid">
        <div>
          <label htmlFor="input">Trade site item</label>
          <textarea
            id="input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Paste item text from POE2 trade search…"
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
        <button id="copy" type="button" onClick={handleCopy}>
          {copyLabel}
        </button>
      </div>

      {unmatched.length > 0 && (
        <div id="warnings">
          <strong>Unmatched modifiers</strong>
          <ul>
            {unmatched.map((mod) => (
              <li key={mod}>{mod}</li>
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
