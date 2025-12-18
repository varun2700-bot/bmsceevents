import { Calendar, Clock, MapPin, Instagram, ExternalLink, IndianRupee } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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

interface EventCardProps {
  event: Event;
}

const pastelColors: Record<string, { bg: string; border: string }> = {
  '#FFE5EC': { bg: 'bg-pastel-pink', border: 'border-l-[#FFB6C1]' },
  '#F0E6FA': { bg: 'bg-pastel-lavender', border: 'border-l-[#E6E6FA]' },
  '#E5F9E5': { bg: 'bg-pastel-mint', border: 'border-l-[#98FB98]' },
  '#FFF0E5': { bg: 'bg-pastel-peach', border: 'border-l-[#FFDAB9]' },
  '#E5F3FF': { bg: 'bg-pastel-blue', border: 'border-l-[#B0E0E6]' },
  '#FFFDE5': { bg: 'bg-pastel-yellow', border: 'border-l-[#FFFFE0]' },
};

const statusColors: Record<string, string> = {
  upcoming: 'bg-emerald-100 text-emerald-800',
  ongoing: 'bg-amber-100 text-amber-800',
  completed: 'bg-gray-100 text-gray-600',
};

export function EventCard({ event }: EventCardProps) {
  const colorStyle = pastelColors[event.bg_color] || pastelColors['#FFE5EC'];
  
  return (
    <div 
      className={`event-card overflow-hidden border-l-4`}
      style={{ 
        backgroundColor: event.bg_color,
        borderLeftColor: colorStyle.border.replace('border-l-[', '').replace(']', '')
      }}
    >
      {event.image_url && (
        <div className="aspect-video w-full overflow-hidden">
          <img 
            src={event.image_url} 
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="p-5">
        {/* Status and Cost badges */}
        <div className="flex gap-2 mb-3">
          <Badge className={statusColors[event.status]}>
            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
          </Badge>
          <Badge variant={event.cost === 'Free' ? 'secondary' : 'default'}>
            {event.cost === 'Paid' ? `₹${event.registration_fee}` : 'Free'}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="font-bold text-lg text-foreground mb-2 line-clamp-2">
          {event.title}
        </h3>

        {/* Description */}
        {event.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {event.description}
          </p>
        )}

        {/* Event details */}
        <div className="space-y-1.5 text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{new Date(event.date).toLocaleDateString('en-US', { 
              weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' 
            })}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{event.venue}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {event.tags?.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Club and Department */}
        <div className="text-xs text-muted-foreground mb-4">
          {event.club && <span className="font-semibold">{event.club}</span>}
          {event.club && event.department !== 'All' && ' • '}
          {event.department !== 'All' && <span>{event.department}</span>}
        </div>

        {/* Action links */}
        <div className="flex gap-2">
          {event.instagram_link && (
            <a href={event.instagram_link} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="gap-1.5">
                <Instagram className="w-4 h-4 text-pink-500" />
                Instagram
              </Button>
            </a>
          )}
          {event.feedback_link && (
            <a href={event.feedback_link} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="gap-1.5">
                <ExternalLink className="w-4 h-4" />
                Feedback
              </Button>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
