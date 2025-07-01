export default function TargetIcon() {
  return (
    <div className="flex items-center justify-center mb-4">
      <svg
        width="56"
        height="56"
        viewBox="0 0 56 56"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mx-auto animate-spin-slow"
      >
        <circle cx="28" cy="28" r="26" stroke="#ef4444" strokeWidth="4" fill="#18181b" />
        <circle cx="28" cy="28" r="12" stroke="#fff" strokeWidth="2" fill="none" />
        <circle cx="28" cy="28" r="4" fill="#ef4444" />
        <line x1="28" y1="2" x2="28" y2="12" stroke="#ef4444" strokeWidth="2" />
        <line x1="28" y1="44" x2="28" y2="54" stroke="#ef4444" strokeWidth="2" />
        <line x1="2" y1="28" x2="12" y2="28" stroke="#ef4444" strokeWidth="2" />
        <line x1="44" y1="28" x2="54" y2="28" stroke="#ef4444" strokeWidth="2" />
      </svg>
    </div>
  );
}