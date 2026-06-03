import React from "react";

type HeaderProps = {
  title: string;
  subtitle?: string;
  onAdd: () => void;
  onRefresh: () => void;
  liveUpdatesHint?: string;
};

export function Header(props: HeaderProps) {
  const { title, subtitle, onAdd, onRefresh, liveUpdatesHint } = props;

  return (
    <header className="header">
      <div className="headerLeft">
        <div className="brandDot" aria-hidden="true" />
        <div className="headerTitleWrap">
          <h1 className="headerTitle">{title}</h1>
          {subtitle ? <div className="headerSubtitle">{subtitle}</div> : null}
        </div>
      </div>

      <div className="headerRight">
        {liveUpdatesHint ? (
          <div className="pill" title={liveUpdatesHint}>
            {liveUpdatesHint}
          </div>
        ) : null}
        <button className="btn btnGhost" onClick={onRefresh}>
          Refresh
        </button>
        <button className="btn btnPrimary" onClick={onAdd}>
          Add product
        </button>
      </div>
    </header>
  );
}
