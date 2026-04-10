export function LogoMark() {
  return (
    <div className="orbital-logo flex h-12 w-12 items-center justify-center rounded-2xl">
      <svg
        aria-hidden="true"
        className="orbital-logo__icon"
        viewBox="0 0 48 48"
        fill="none"
      >
        <circle className="orbital-logo__core-glow" cx="24" cy="24" r="11" />
        <circle className="orbital-logo__core" cx="24" cy="24" r="6.5" />
        <ellipse
          className="orbital-logo__orbit-line orbital-logo__orbit-line--outer"
          cx="24"
          cy="24"
          rx="16"
          ry="8.5"
          transform="rotate(-28 24 24)"
        />
        <ellipse
          className="orbital-logo__orbit-line orbital-logo__orbit-line--inner"
          cx="24"
          cy="24"
          rx="13"
          ry="6.5"
          transform="rotate(24 24 24)"
        />
        <circle className="orbital-logo__star-dot" cx="34.5" cy="14" r="2.4" />
      </svg>
    </div>
  );
}
