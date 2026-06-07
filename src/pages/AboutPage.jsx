import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import KofiButton from '../components/KofiButton.jsx'

export default function AboutPage() {
  const { hash } = useLocation()

  // React Router no hace scroll al ancla solo: lo hacemos al montar / cambiar hash.
  useEffect(() => {
    if (!hash) return
    const el = document.querySelector(hash)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [hash])

  return (
    <div className="about">
      <h1 className="about-title">About Score Analytics Predictions</h1>
      <p className="about-lead">
        An informational tool that forecasts every match and outcome of the 2026 FIFA World Cup
        using a statistical model — with transparent probabilities and the reasoning behind them.
      </p>

      <nav className="about-nav">
        <a href="#how-to-read">How to read the predictions</a>
        <a href="#about-model">About the model</a>
      </nav>

      {/* ---------- Sección 1 ---------- */}
      <section id="how-to-read" className="about-section">
        <h2>How to read the predictions</h2>
        <p>
          Every number on the site is a <b>probability</b>, not a promise. Football is unpredictable,
          and that's exactly why we express things as chances. Here's what each part means.
        </p>

        <h3>Win / Draw / Loss probabilities</h3>
        <p>
          Each match shows three percentages — the chance the first team wins, the match ends in a
          draw, or the second team wins. They always add up to 100%. A higher number means the model
          considers that result more likely, but even a strong favorite loses from time to time. We
          label them with each team's three-letter code (for example, <i>MEX – Draw – RSA</i>) so it's
          always clear which side is which.
        </p>

        <h3>xG — Expected Goals</h3>
        <p>
          xG estimates how many goals a team is expected to score, based on the quality and number of
          chances they're likely to create. An xG of 1.8 means roughly "about two goals' worth of
          opportunities." It's a steadier measure of how well a team plays than the final score alone,
          which can swing on a single deflection or save.
        </p>

        <h3>Predicted scoreline</h3>
        <p>
          This is the single most representative result for the match, drawn from the underlying goal
          expectations. Treat it as the "typical" outcome rather than a guarantee — plenty of other
          scorelines are possible, and the probabilities show how the rest are spread out.
        </p>

        <h3>BTTS — Both Teams to Score</h3>
        <p>
          The probability that <i>both</i> teams score at least once. It's a quick read on the
          character of a game: a high BTTS suggests an open, end-to-end match, while a low one points
          to a tight, cagey affair.
        </p>

        <h3>Exact score probabilities</h3>
        <p>
          Open any match for the full grid of exact scorelines — first team's goals along one axis,
          the other team's along the other. Greener cells are more likely. It's the complete picture
          behind that single predicted scoreline.
        </p>

        <h3>Tournament progression odds</h3>
        <p>
          For every team, the chance of reaching each stage — Round of 16, Quarter-finals,
          Semi-finals, the Final, and lifting the trophy. These come from simulating the entire
          tournament many thousands of times and counting how often each team gets there.
        </p>

        <h3>Group standing odds</h3>
        <p>
          Within each group, every team's chance of finishing 1st, 2nd, 3rd, or 4th. The top two of
          each group advance to the knockout rounds, so 1st and 2nd are the "qualifying" positions to
          watch.
        </p>

        <h3 id="tiers">Confidence tiers</h3>
        <p>
          Every match is tagged with a tier from A to E that summarizes how confident the model is in
          a clear pick. It's a quick way to tell apart a lopsided match from a coin-flip:
        </p>
        <ul className="tier-legend">
          <li>
            <span className="tier-badge tier-A">Tier A</span>
            <span><b>Strong favorite</b> — one result stands out clearly, by a wide margin.</span>
          </li>
          <li>
            <span className="tier-badge tier-B">Tier B</span>
            <span><b>Clear favorite</b> — a likely winner, with a solid but smaller edge.</span>
          </li>
          <li>
            <span className="tier-badge tier-C">Tier C</span>
            <span><b>Draw-leaning</b> — no strong favorite and the draw is a real possibility.</span>
          </li>
          <li>
            <span className="tier-badge tier-D">Tier D</span>
            <span><b>Slight edge</b> — one side is favored, but only mildly.</span>
          </li>
          <li>
            <span className="tier-badge tier-E">Tier E</span>
            <span><b>Toss-up</b> — evenly matched, with no confident pick.</span>
          </li>
        </ul>
        <p>
          In practice, most group-stage matches land in tiers <b>A–C</b>: a game with no clear favorite
          usually has a high draw probability, which places it in C. The lower tiers D and E are
          reserved for the rare, very tight match-ups, so you'll mostly see them — if at all — in the
          knockout rounds.
        </p>
        <p>
          As matches are played, we track the <b>success rate of each tier</b> on the home page, so you
          can see how reliable the model is at every level of confidence — the stronger the tier, the
          more often it should be right.
        </p>
      </section>

      {/* ---------- Sección 2 ---------- */}
      <section id="about-model" className="about-section">
        <h2>About the model</h2>

        <h3>Approach &amp; methodology</h3>
        <p>
          Predictions come from a hybrid statistical model. A team's underlying strength is anchored by
          a rating system that tracks international results over time and is adjusted for the quality of
          each squad. A separate goals-based component translates that strength into realistic scoreline
          distributions — not just win, draw or loss, but the full range of plausible scores. The two
          are combined into an ensemble, and the tournament itself is then simulated tens of thousands
          of times to produce the progression and group-standing odds.
        </p>
        <p>
          Throughout, the guiding principle is <b>calibration</b>: we care that a stated 60% chance
          actually happens about 60% of the time, rather than simply maximizing how many calls land.
          We also apply conservative, physically-motivated adjustments specific to a 2026 World Cup
          played across North America — host effects, the travel and continental dimension, and venue
          conditions such as altitude, heat and whether a stadium is roofed.
        </p>

        <h3>Data sources</h3>
        <p>
          The model draws on historical and current international match results, squad and player market
          valuations, official tournament fixtures and venues, and seasonal climate references for each
          host city. Prices from sharp bookmakers are used only as an external benchmark for context —
          a sanity check against the market, never something the model simply copies.
        </p>

        <h3>Update frequency by round</h3>
        <p>
          Forecasts are refreshed as the tournament unfolds. Group-stage predictions are published
          ahead of kickoff; then, at the close of each round, ratings and squad information are updated
          and the knockout-round forecasts are republished as the bracket takes shape. Final results
          from completed matches feed the post-mortem table and the per-tier success tracking.
        </p>

        <h3>Limitations</h3>
        <p>
          No model can predict football with certainty. International tournaments are short, with
          limited recent data per team, frequent squad turnover, and high game-to-game variance — a
          single match is a noisy event. The contextual adjustments (travel, climate, altitude) are
          informed estimates rather than precise measurements, and the weather shown reflects typical
          seasonal conditions for the venue, not a live forecast. The model has no knowledge of
          in-tournament injuries, suspensions, tactical surprises or motivation. Read every number as a
          probability, not a prophecy.
        </p>

        <h3>Version &amp; disclaimer</h3>
        <p>
          Current model version: <b>1.0.0</b>. Score Analytics Predictions is an informational and
          educational tool. It is not betting advice, and nothing here guarantees any outcome. If you
          choose to bet, please do so responsibly and within your means — the decision and the risk are
          entirely your own.
        </p>
      </section>

      <div className="about-support">
        <p>
          Like the site? Help us build new features — more markets, deeper stats and
          better visualizations. Every contribution goes straight into improving it.
        </p>
        <KofiButton />
      </div>

      <section className="about-contact">
        <h2>Contact</h2>
        <p>Have questions about the model or the platform?</p>
        <a href="mailto:contact@scoreanalyticspredictions.com">contact@scoreanalyticspredictions.com</a>
      </section>
    </div>
  )
}
