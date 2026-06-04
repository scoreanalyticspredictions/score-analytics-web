import Logo from './Logo.jsx'

function formatTs(ts) {
  if (!ts) return '—'
  try {
    return new Date(ts).toLocaleString('en-US', {
      dateStyle: 'medium', timeStyle: 'short',
    })
  } catch {
    return ts
  }
}

export default function Header({ lastUpdated }) {
  return (
    <header className="header">
      <div className="container">
        <div className="header-top">
          <Logo />
          <span className="badge-wc">FIFA World Cup 2026</span>
        </div>
        <div className="header-sub">
          Last updated: <b>{formatTs(lastUpdated)}</b>
        </div>
      </div>
    </header>
  )
}
