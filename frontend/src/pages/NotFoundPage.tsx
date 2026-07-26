import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <main className="page not-found-page">
      <div className="not-found-icon">🏚️</div>
      <h1 className="not-found-title">404 — Page Not Found</h1>
      <p className="not-found-msg">
        Looks like this page doesn't exist. Maybe it was demolished?
      </p>
      <Link to="/" id="back-home-link" className="back-home-btn">
        ← Back to Home
      </Link>
    </main>
  );
}
