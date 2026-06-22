const GeminiIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M12 2L2 19.5h20L12 2z" fill="url(#gemini-gradient)" />
    <defs>
      <linearGradient id="gemini-gradient" x1="2" y1="19.5" x2="22" y2="19.5">
        <stop offset="0%" stopColor="#4285F4" />
        <stop offset="50%" stopColor="#9B72CB" />
        <stop offset="100%" stopColor="#D96570" />
      </linearGradient>
    </defs>
  </svg>
);

export default GeminiIcon;
