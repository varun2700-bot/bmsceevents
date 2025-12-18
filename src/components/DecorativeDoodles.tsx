export function DecorativeDoodles() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Star - top left */}
      <svg 
        className="absolute animate-twinkle opacity-15" 
        style={{ top: '10%', left: '5%', width: '60px' }} 
        viewBox="0 0 100 100"
      >
        <polygon points="50,10 61,35 88,35 67,52 78,78 50,60 22,78 33,52 12,35 39,35" fill="#FFB6C1"/>
      </svg>
      
      {/* Circle - top right */}
      <svg 
        className="absolute animate-float opacity-15" 
        style={{ top: '15%', right: '8%', width: '50px' }} 
        viewBox="0 0 100 100"
      >
        <circle cx="50" cy="50" r="40" fill="none" stroke="#E6E6FA" strokeWidth="4" strokeDasharray="10,5"/>
      </svg>
      
      {/* Zigzag - middle left */}
      <svg 
        className="absolute animate-wiggle opacity-15" 
        style={{ top: '40%', left: '3%', width: '70px' }} 
        viewBox="0 0 100 100"
      >
        <path d="M10,50 L30,30 L50,50 L70,30 L90,50" fill="none" stroke="#98FB98" strokeWidth="3"/>
      </svg>
      
      {/* Star - middle right */}
      <svg 
        className="absolute animate-twinkle opacity-15" 
        style={{ top: '60%', right: '5%', width: '55px' }} 
        viewBox="0 0 100 100"
      >
        <polygon points="50,10 61,35 88,35 67,52 78,78 50,60 22,78 33,52 12,35 39,35" fill="#FFDAB9"/>
      </svg>
      
      {/* Concentric circles - bottom left */}
      <svg 
        className="absolute animate-float opacity-15" 
        style={{ bottom: '15%', left: '7%', width: '65px' }} 
        viewBox="0 0 100 100"
      >
        <circle cx="50" cy="50" r="35" fill="none" stroke="#B0E0E6" strokeWidth="5"/>
        <circle cx="50" cy="50" r="20" fill="none" stroke="#B0E0E6" strokeWidth="3"/>
      </svg>
      
      {/* Wave - bottom right */}
      <svg 
        className="absolute animate-wiggle opacity-15" 
        style={{ bottom: '20%', right: '10%', width: '60px' }} 
        viewBox="0 0 100 100"
      >
        <path d="M20,20 Q35,50 50,20 T80,20" fill="none" stroke="#FFFFE0" strokeWidth="4"/>
      </svg>
    </div>
  );
}
