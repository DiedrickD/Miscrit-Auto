// Static controls are wired by the existing automation controller.
export default function TeamPanel() {
  return (
    <section id="tab-team" className="tab-panel" hidden>
      <article className="card training-card">
        <span className="eyebrow">TRAINING</span>
        <h2>Auto level-up</h2>
        <label className="switch-row">
          <div>
            <strong>Level up with earned XP</strong>
            <small>
              Train active teammates up to level 35 between battles.
            </small>
          </div>
          <input id="auto-level" type="checkbox" role="switch" />
        </label>
        <p className="muted">
          Runs while automation is on, in hunting and campaign. Each level uses
          earned XP only. No platinum or XP tokens are spent. Selected-copy
          training below caps slots 2-4 at level 30 and works even when this
          general training toggle is off.
        </p>
        <button className="button save full">Save training settings</button>
      </article>
      <article className="card">
        <div className="card-heading">
          <div>
            <span className="eyebrow">THE ADVENTURING PARTY</span>
            <h2>Your active team</h2>
          </div>
          <span className="badge">Slot 1 stays yours</span>
        </div>
        <div id="team-cards" className="team-grid"></div>
      </article>
      <div className="two-columns team-bottom">
        <article className="card">
          <span className="eyebrow">ROOM TO GROW</span>
          <h2>Automatic team selection</h2>
          <label className="switch-row">
            <div>
              <strong>Train best 17+ copies to level 30</strong>
              <small>
                Uses the replacement list below. Grouped by Exotic, Rare,
                Common, Epic and Legendary. Keeps slot 1; selects the best rated
                17+ copy per species for slots 2-4.
              </small>
            </div>
            <input id="train-selected" type="checkbox" role="switch" />
          </label>
          <p className="hint" id="selected-training-status">
            Missing a rating-17+ copy? Skip to another eligible species and
            queue a capture for that species. Completed copies stop at level 30.
          </p>
          <label className="switch-row">
            <div>
              <strong>Replace slots 2–4 at level 35</strong>
              <small>Choose the highest-rated owned copy below level 35.</small>
            </div>
            <input id="replace" type="checkbox" role="switch" />
          </label>
          <form id="replacement-form" className="search-form">
            <input
              id="replacement-input"
              list="species"
              placeholder="Add a replacement species…"
              aria-label="Replacement species"
            />
            <button className="button small">Add +</button>
          </form>
          <p className="fine-print">
            Add owned 17+ copies or mapped capture targets per tier. Collection
            and Miscrits index are checked; a family already at level 30 or
            evolved to its fourth form is skipped, even if another copy has a
            higher rating.
          </p>
          <p id="tier-access" className="hint" role="status">
            Sign in to load your collection and unlock tier buttons.
          </p>
          <button
            id="tier-account-action"
            type="button"
            className="button small"
          >
            Sign in
          </button>
          <div id="replacement-list" className="tier-list"></div>
          <button className="button save full">Save team settings</button>
        </article>
        <article className="card">
          <span className="eyebrow">ON THE BENCH</span>
          <h2 id="roster-title">Eligible replacements</h2>
          <p className="muted">
            Owned copies from your separate replacement list, sorted by rating.
          </p>
          <div id="replacement-roster" className="roster"></div>
        </article>
      </div>
    </section>
  );
}
