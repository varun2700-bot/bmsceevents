import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Settings, LogOut } from 'lucide-react';

export function Header() {
  const [time, setTime] = useState(new Date());
  const { user, isAdmin, signOut } = useAuth();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour12: false });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <header className="bg-primary text-primary-foreground shadow-lg relative border-b-2 border-muted-foreground/20">
      {/* Wavy decoration */}
      <div className="absolute bottom-0 left-0 w-full h-[30px] overflow-hidden z-0 pointer-events-none">
        <svg viewBox="0 0 1200 30" preserveAspectRatio="none" className="w-full h-full">
          <path d="M0,15 Q150,5 300,15 T600,15 T900,15 T1200,15 L1200,30 L0,30 Z" fill="#2d3d2d" opacity="0.8"/>
          <path d="M0,18 Q150,8 300,18 T600,18 T900,18 T1200,18 L1200,30 L0,30 Z" fill="#3a4a3a" opacity="0.6"/>
        </svg>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 relative z-10">
        <div className="flex items-center justify-between py-2">
          {/* Logo */}
          <div className="flex-none w-64">
            <Link to="/">
              <h1 className="text-lg font-bold tracking-tight">BMSCE EVENT HUB</h1>
              <p className="text-xs text-primary-foreground/70 font-medium">BMS College of Engineering</p>
            </Link>
          </div>

          {/* Time Display */}
          <div className="flex-1 flex justify-center">
            <div className="time-display text-center">
              <div className="text-2xl md:text-3xl font-bold mb-0 leading-none">
                {formatTime(time)}
              </div>
              <div className="text-xs text-primary-foreground/70 -mt-1">
                {formatDate(time)}
              </div>
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="flex-none w-64 flex justify-end gap-2">
            {user ? (
              <>
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="secondary" size="sm" className="gap-2">
                      <Settings className="w-4 h-4" />
                      Admin
                    </Button>
                  </Link>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={signOut}
                  className="gap-2 bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button variant="secondary" size="sm" className="font-bold">
                  Admin Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
