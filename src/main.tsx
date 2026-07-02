import {
  StrictMode,
  useCallback,
  useEffect,
  useState,
  type KeyboardEvent,
} from "react";
import { createRoot } from "react-dom/client";
import { convertItem } from "./lib/convert";
import type { ModifierRule, UniqueRule } from "./lib/types";
import "./App.css";

const GITHUB_REPO = "https://github.com/Ryziou/poe2-fists-of-stone-converter";
const UNIQUES_SOURCE = "https://poe2db.tw/us/Way_of_the_Stonefist";

function GitHubIcon() {
  return (
    <svg
      className="icon-github"
      viewBox="0 0 16 16"
      width="18"
      height="18"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"
      />
    </svg>
  );
}

function App() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [unmatched, setUnmatched] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [rules, setRules] = useState<ModifierRule[]>([]);
  const [uniques, setUniques] = useState<UniqueRule[]>([]);
  const [rulesError, setRulesError] = useState("");
  const [copyLabel, setCopyLabel] = useState("Copy output");

  useEffect(() => {
    Promise.all([
      fetch(`${import.meta.env.BASE_URL}modifiers.json`),
      fetch(`${import.meta.env.BASE_URL}uniques.json`),
    ])
      .then(async ([modifiersRes, uniquesRes]) => {
        if (!modifiersRes.ok) throw new Error(`HTTP ${modifiersRes.status}`);
        if (!uniquesRes.ok) throw new Error(`HTTP ${uniquesRes.status}`);
        const [modifiersData, uniquesData] = await Promise.all([
          modifiersRes.json(),
          uniquesRes.json(),
        ]);
        if (!Array.isArray(modifiersData) || !Array.isArray(uniquesData)) {
          throw new Error("Invalid conversion data");
        }
        setRules(modifiersData as ModifierRule[]);
        setUniques(uniquesData as UniqueRule[]);
        setRulesError("");
      })
      .catch(() => {
        setRulesError(
          "Could not load conversion rules. Refresh the page or try again later."
        );
      });
  }, []);

  const canCopy = Boolean(output) && !error && !rulesError && unmatched.length === 0;

  const runConvert = useCallback(() => {
    if (rulesError) {
      setOutput("");
      setUnmatched([]);
      setError(rulesError);
      setNotice("");
      return;
    }

    if (!rules.length || !uniques.length) {
      setOutput("Loading conversion rules…");
      setUnmatched([]);
      setError("");
      setNotice("");
      return;
    }

    const text = input.trim();
    if (!text) {
      setOutput("");
      setUnmatched([]);
      setError("");
      setNotice("");
      return;
    }

    const result = convertItem(text, rules, uniques);
    setOutput(result.text);
    setUnmatched(result.unmatched);
    setError(result.error ?? "");
    setNotice(result.notice ?? "");
  }, [input, rules, uniques, rulesError]);

  const handleCopy = async () => {
    if (!canCopy) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopyLabel("Copied!");
      setTimeout(() => setCopyLabel("Copy output"), 1500);
    } catch {
      setCopyLabel("Copy failed");
      setTimeout(() => setCopyLabel("Copy output"), 2000);
    }
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
        Rare and unique gloves are supported, not magic or normal items. Unique
        gloves use fixed Fists conversions from{" "}
        <a href={UNIQUES_SOURCE} target="_blank" rel="noopener noreferrer">
          PoE2DB
        </a>
        . When a Fists modifier has a range like (21-23)%, the output uses the
        lowest roll. PoB may interpret ranges differently on your end.
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

      {notice && (
        <div id="notices" role="status">
          <strong>Note</strong>
          <p>{notice}</p>
        </div>
      )}

      {unmatched.length > 0 && (
        <div id="warnings">
          <strong>Unmatched modifiers</strong>
          <p className="warn-detail">
            Fix or remove these before copying. They are omitted from the output
            so Path of Building is not given invalid lines.
          </p>
          <ul>
            {unmatched.map((mod, i) => (
              <li key={`${i}-${mod}`}>{mod}</li>
            ))}
          </ul>
        </div>
      )}
      <details className="help">
        <summary>How to use this tool</summary>
        <div className="help-body">
          <ol>
            <li>
              Find a <strong>rare glove</strong> on the POE2 trade site or in
              your stash.
            </li>
            <li>
              Copy the full item text. On the trade site, use your copy script
              or the listing copy button. In-game, hover the item and press
              Ctrl+C.
            </li>
            <li>
              Paste into the left box and click <strong>Convert</strong> (or
              press Ctrl+Enter).
            </li>
            <li>
              Check the output on the right. If you see unmatched modifiers,
              the item cannot be copied safely yet. Those lines are left out of
              the output.
            </li>
            <li>
              When copy is enabled, click <strong>Copy output</strong> and
              paste the result into Path of Building as a custom item.
            </li>
          </ol>
          <h3>What is supported</h3>
          <ul>
            <li>Rare gloves (modifier-by-modifier conversion)</li>
            <li>
              Unique gloves (fixed output per unique, from{" "}
              <a href={UNIQUES_SOURCE} target="_blank" rel="noopener noreferrer">
                PoE2DB
              </a>
              )
            </li>
            <li>Trade site paste and in-game copy formats</li>
            <li>
              Modifier ranges in the output use the lowest roll, e.g. (21-23)%
              becomes 21%
            </li>
          </ul>
          <h3>Common issues</h3>
          <ul>
            <li>
              <strong>Cannot convert / wrong item type:</strong> Only glove
              items work. Other item classes are rejected.
            </li>
            <li>
              <strong>Unknown unique:</strong> The unique name was not found in
              the table. Run <code>npm run build:uniques</code> to refresh from
              PoE2DB, or open an issue on GitHub.
            </li>
            <li>
              <strong>Unmatched modifiers:</strong> A mod on the glove is not in
              the conversion table yet. Open an issue on GitHub with the pasted
              item text.
            </li>
            <li>
              <strong>Copy button disabled:</strong> Fix errors or unmatched
              mods first, then convert again.
            </li>
          </ul>
        </div>
      </details>
      <footer className="footer">
        <a
          className="footer-link footer-github"
          href={GITHUB_REPO}
          target="_blank"
          rel="noopener noreferrer"
        >
          <GitHubIcon />
          GitHub
        </a>
      </footer>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
