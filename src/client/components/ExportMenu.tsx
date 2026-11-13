import { useState } from "react";
import type { Mode } from "../../shared/markdown/types";
import { Icon } from "./Icon";

type Props = {
  onExport: (mode: Mode) => void;
};

// the Export button in the top bar, with a small menu to choose README or Issues
export function ExportMenu({ onExport }: Props) {
  const [open, setOpen] = useState(false);

  function choose(mode: Mode) {
    setOpen(false);
    onExport(mode);
  }

  return (
    <div className="export">
      <button
        className={"export-button" + (open ? " open" : "")}
        onClick={() => setOpen(!open)}
      >
        <Icon name="upload" />
        Export
        <Icon name="chevronDown" />
      </button>

      {open && (
        <>
          <div className="menu-backdrop" onClick={() => setOpen(false)} />
          <div className="export-menu">
            <button className="menu-item" onClick={() => choose("readme")}>
              README
            </button>
            <button className="menu-item" onClick={() => choose("issues")}>
              Issues
            </button>
          </div>
        </>
      )}
    </div>
  );
}
