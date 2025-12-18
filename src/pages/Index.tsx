import { useState, useEffect, useMemo } from 'react';
import { Search, LayoutGrid, List } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { DecorativeDoodles } from '@/components/DecorativeDoodles';
import { EventCard } from '@/components/EventCard';
import { NewsCard } from '@/components/NewsCard';
import { FiltersSidebar } from '@/components/FiltersSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;
  time: string;
  venue: string;
  department: string;
  tags: string[];
  club: string | null;
  status: string;
  cost: string;
  registration_fee: number;
  instagram_link: string | null;
  feedback_link: string | null;
  image_url: string | null;
  bg_color: string;
}

interface News {
  id: string;
  title: string;
  content: string;
  date: string;
  accent_color: string;
  bg_color: string;
}

export default function Index() {
  const [events, setEvents] = useState<Event[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [view, setView] = useState<'posterboard' | 'timeline'>('posterboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    departments: [] as string[],
    tags: [] as string[],
    clubs: [] as string[],
    statuses: [] as string[],
    costs: [] as string[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [eventsRes, newsRes] = await Promise.all([
      supabase.from('events').select('*').order('date', { ascending: true }),
      supabase.from('news').select('*').order('date', { ascending: false }).limit(6),
    ]);

    if (eventsRes.data) setEvents(eventsRes.data);
    if (newsRes.data) setNews(newsRes.data);
    setLoading(false);
  };

  const availableFilters = useMemo(() => {
    const departments = [...new Set(events.map(e => e.department))].sort();
    const tags = [...new Set(events.flatMap(e => e.tags || []))].sort();
    const clubs = [...new Set(events.map(e => e.club).filter(Boolean) as string[])].sort();
    const statuses = ['upcoming', 'ongoing', 'completed'];
    const costs = ['Free', 'Paid'];
    
    return { departments, tags, clubs, statuses, costs };
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matches = 
          event.title.toLowerCase().includes(query) ||
          event.description?.toLowerCase().includes(query) ||
          event.venue.toLowerCase().includes(query) ||
          event.club?.toLowerCase().includes(query);
        if (!matches) return false;
      }

      // Category filters
      if (filters.departments.length && !filters.departments.includes(event.department)) return false;
      if (filters.tags.length && !filters.tags.some(t => event.tags?.includes(t))) return false;
      if (filters.clubs.length && (!event.club || !filters.clubs.includes(event.club))) return false;
      if (filters.statuses.length && !filters.statuses.includes(event.status)) return false;
      if (filters.costs.length && !filters.costs.includes(event.cost)) return false;

      return true;
    });
  }, [events, searchQuery, filters]);

  return (
    <div className="min-h-screen flex flex-col">
      <DecorativeDoodles />
      <Header />
      
      {/* Sub-header with view toggle and search */}
      <div className="bg-card border-b border-border shadow-sm relative z-10">
        <div className="max-w-[1600px] mx-auto px-6 py-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant={view === 'posterboard' ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setView('posterboard')}
                className="gap-2"
              >
                <LayoutGrid className="w-4 h-4" />
                Posterboard
              </Button>
              <Button
                variant={view === 'timeline' ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setView('timeline')}
                className="gap-2"
              >
                <List className="w-4 h-4" />
                Timeline
              </Button>
            </div>

            <div className="relative flex-1 max-w-md ml-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 max-w-[1600px] mx-auto px-6 py-6 flex gap-6 relative z-10 w-full">
        <FiltersSidebar 
          filters={filters} 
          setFilters={setFilters}
          availableFilters={availableFilters}
        />

        <main className="flex-1">
          {/* News Section */}
          {news.length > 0 && (
            <div className="mb-8">
              <div className="bg-card rounded-lg p-4 mb-6 shadow-md border border-border">
                <h2 className="text-2xl font-bold text-foreground">Current News</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {news.map((item) => (
                  <NewsCard key={item.id} news={item} />
                ))}
              </div>
            </div>
          )}

          {/* Events Section */}
          <div className="mb-8">
            <div className="bg-card rounded-lg p-4 mb-6 shadow-md border border-border">
              <h2 className="text-2xl font-bold text-foreground">Events</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Showing <span className="font-bold text-foreground">{filteredEvents.length}</span> of{' '}
                <span className="font-bold text-foreground">{events.length}</span> events
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading events...</p>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-lg border border-border">
                <p className="text-muted-foreground">No events found matching your criteria.</p>
              </div>
            ) : view === 'posterboard' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEvents.map((event) => (
                  <div key={event.id} className="flex gap-4 items-start">
                    <div className="w-24 text-right text-sm text-muted-foreground">
                      <div className="font-semibold">{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                      <div>{event.time}</div>
                    </div>
                    <div className="w-px bg-border self-stretch" />
                    <div className="flex-1">
                      <EventCard event={event} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
