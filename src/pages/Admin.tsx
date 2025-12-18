import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Edit2, X, Save, Upload, Newspaper, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

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

const defaultEvent = {
  title: '',
  description: '',
  date: new Date().toISOString().split('T')[0],
  time: '10:00 AM',
  venue: '',
  department: 'All',
  tags: [] as string[],
  club: '',
  status: 'upcoming',
  cost: 'Free',
  registration_fee: 0,
  instagram_link: '',
  feedback_link: '',
  image_url: '',
  bg_color: '#FFE5EC',
};

const defaultNews = {
  title: '',
  content: '',
  date: new Date().toISOString().split('T')[0],
  accent_color: '#FFB6C1',
  bg_color: '#FFE5EC',
};

const bgColorOptions = [
  { value: '#FFE5EC', label: 'Pink', color: '#FFE5EC' },
  { value: '#F0E6FA', label: 'Lavender', color: '#F0E6FA' },
  { value: '#E5F9E5', label: 'Mint', color: '#E5F9E5' },
  { value: '#FFF0E5', label: 'Peach', color: '#FFF0E5' },
  { value: '#E5F3FF', label: 'Blue', color: '#E5F3FF' },
  { value: '#FFFDE5', label: 'Yellow', color: '#FFFDE5' },
];

const tagOptions = ['Cultural', 'Technical', 'Sports', 'Social', 'Workshop', 'Seminar', 'Competition'];
const departmentOptions = ['All', 'CSE', 'ECE', 'ISE', 'Mechanical', 'Civil', 'Biotech', 'EEE'];
const statusOptions = ['upcoming', 'ongoing', 'completed'];

export default function Admin() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [events, setEvents] = useState<Event[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [eventForm, setEventForm] = useState(defaultEvent);
  const [newsForm, setNewsForm] = useState(defaultNews);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [newsDialogOpen, setNewsDialogOpen] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      toast({ title: 'Access denied', description: 'You need admin privileges to access this page.', variant: 'destructive' });
      navigate('/');
    }
  }, [user, isAdmin, authLoading, navigate, toast]);

  useEffect(() => {
    if (isAdmin) fetchData();
  }, [isAdmin]);

  const fetchData = async () => {
    const [eventsRes, newsRes] = await Promise.all([
      supabase.from('events').select('*').order('date', { ascending: false }),
      supabase.from('news').select('*').order('created_at', { ascending: false }),
    ]);

    if (eventsRes.data) setEvents(eventsRes.data);
    if (newsRes.data) setNews(newsRes.data);
    setLoading(false);
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    
    const { error: uploadError, data } = await supabase.storage
      .from('event-images')
      .upload(fileName, file);

    if (uploadError) {
      toast({ title: 'Upload failed', description: uploadError.message, variant: 'destructive' });
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('event-images').getPublicUrl(fileName);
    setEventForm(prev => ({ ...prev, image_url: publicUrl }));
    setUploading(false);
    toast({ title: 'Image uploaded', description: 'Image has been uploaded successfully.' });
  };

  const addTag = () => {
    if (tagInput && !eventForm.tags.includes(tagInput)) {
      setEventForm(prev => ({ ...prev, tags: [...prev.tags, tagInput] }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setEventForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const saveEvent = async () => {
    if (!eventForm.title || !eventForm.venue || !eventForm.date) {
      toast({ title: 'Error', description: 'Please fill in required fields (title, venue, date)', variant: 'destructive' });
      return;
    }

    const eventData = {
      ...eventForm,
      club: eventForm.club || null,
      instagram_link: eventForm.instagram_link || null,
      feedback_link: eventForm.feedback_link || null,
      image_url: eventForm.image_url || null,
      description: eventForm.description || null,
    };

    if (editingEventId) {
      const { error } = await supabase.from('events').update(eventData).eq('id', editingEventId);
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Event updated', description: 'The event has been updated successfully.' });
      }
    } else {
      const { error } = await supabase.from('events').insert(eventData);
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Event created', description: 'The event has been created successfully.' });
      }
    }

    setEventDialogOpen(false);
    setEventForm(defaultEvent);
    setEditingEventId(null);
    fetchData();
  };

  const editEvent = (event: Event) => {
    setEventForm({
      title: event.title,
      description: event.description || '',
      date: event.date,
      time: event.time,
      venue: event.venue,
      department: event.department,
      tags: event.tags || [],
      club: event.club || '',
      status: event.status,
      cost: event.cost,
      registration_fee: event.registration_fee,
      instagram_link: event.instagram_link || '',
      feedback_link: event.feedback_link || '',
      image_url: event.image_url || '',
      bg_color: event.bg_color,
    });
    setEditingEventId(event.id);
    setEventDialogOpen(true);
  };

  const deleteEvent = async (id: string) => {
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Event deleted', description: 'The event has been deleted.' });
      fetchData();
    }
  };

  const saveNews = async () => {
    if (!newsForm.title || !newsForm.content) {
      toast({ title: 'Error', description: 'Please fill in title and content', variant: 'destructive' });
      return;
    }

    if (editingNewsId) {
      const { error } = await supabase.from('news').update(newsForm).eq('id', editingNewsId);
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'News updated', description: 'The news item has been updated successfully.' });
      }
    } else {
      const { error } = await supabase.from('news').insert(newsForm);
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'News created', description: 'The news item has been created successfully.' });
      }
    }

    setNewsDialogOpen(false);
    setNewsForm(defaultNews);
    setEditingNewsId(null);
    fetchData();
  };

  const editNews = (item: News) => {
    setNewsForm({
      title: item.title,
      content: item.content,
      date: item.date,
      accent_color: item.accent_color,
      bg_color: item.bg_color,
    });
    setEditingNewsId(item.id);
    setNewsDialogOpen(true);
  };

  const deleteNews = async (id: string) => {
    const { error } = await supabase.from('news').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'News deleted', description: 'The news item has been deleted.' });
      fetchData();
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 max-w-6xl mx-auto px-6 py-8 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage events and news for BMSCE Event Hub</p>
        </div>

        <Tabs defaultValue="events" className="space-y-6">
          <TabsList>
            <TabsTrigger value="events" className="gap-2">
              <Calendar className="w-4 h-4" />
              Events ({events.length})
            </TabsTrigger>
            <TabsTrigger value="news" className="gap-2">
              <Newspaper className="w-4 h-4" />
              News ({news.length})
            </TabsTrigger>
          </TabsList>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">All Events</h2>
              <Dialog open={eventDialogOpen} onOpenChange={(open) => {
                setEventDialogOpen(open);
                if (!open) {
                  setEventForm(defaultEvent);
                  setEditingEventId(null);
                }
              }}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingEventId ? 'Edit Event' : 'Create New Event'}</DialogTitle>
                    <DialogDescription>Fill in the event details below.</DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input
                          id="title"
                          value={eventForm.title}
                          onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Event title"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="venue">Venue *</Label>
                        <Input
                          id="venue"
                          value={eventForm.venue}
                          onChange={(e) => setEventForm(prev => ({ ...prev, venue: e.target.value }))}
                          placeholder="Event venue"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={eventForm.description}
                        onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Event description"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="date">Date *</Label>
                        <Input
                          id="date"
                          type="date"
                          value={eventForm.date}
                          onChange={(e) => setEventForm(prev => ({ ...prev, date: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="time">Time</Label>
                        <Input
                          id="time"
                          value={eventForm.time}
                          onChange={(e) => setEventForm(prev => ({ ...prev, time: e.target.value }))}
                          placeholder="10:00 AM"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Select
                          value={eventForm.department}
                          onValueChange={(value) => setEventForm(prev => ({ ...prev, department: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {departmentOptions.map(dept => (
                              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={eventForm.status}
                          onValueChange={(value) => setEventForm(prev => ({ ...prev, status: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map(s => (
                              <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cost">Cost</Label>
                        <Select
                          value={eventForm.cost}
                          onValueChange={(value) => setEventForm(prev => ({ ...prev, cost: value, registration_fee: value === 'Free' ? 0 : prev.registration_fee }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Free">Free</SelectItem>
                            <SelectItem value="Paid">Paid</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {eventForm.cost === 'Paid' && (
                        <div className="space-y-2">
                          <Label htmlFor="fee">Registration Fee (₹)</Label>
                          <Input
                            id="fee"
                            type="number"
                            value={eventForm.registration_fee}
                            onChange={(e) => setEventForm(prev => ({ ...prev, registration_fee: parseInt(e.target.value) || 0 }))}
                          />
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="club">Club/Organizer</Label>
                        <Input
                          id="club"
                          value={eventForm.club}
                          onChange={(e) => setEventForm(prev => ({ ...prev, club: e.target.value }))}
                          placeholder="Organizing club name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Card Color</Label>
                        <Select
                          value={eventForm.bg_color}
                          onValueChange={(value) => setEventForm(prev => ({ ...prev, bg_color: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {bgColorOptions.map(opt => (
                              <SelectItem key={opt.value} value={opt.value}>
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 rounded" style={{ backgroundColor: opt.color }} />
                                  {opt.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Tags</Label>
                      <div className="flex gap-2 mb-2 flex-wrap">
                        {eventForm.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="gap-1">
                            {tag}
                            <X className="w-3 h-3 cursor-pointer" onClick={() => removeTag(tag)} />
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Select value={tagInput} onValueChange={setTagInput}>
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select a tag" />
                          </SelectTrigger>
                          <SelectContent>
                            {tagOptions.filter(t => !eventForm.tags.includes(t)).map(tag => (
                              <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button type="button" variant="outline" onClick={addTag}>Add</Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="instagram">Instagram Link</Label>
                        <Input
                          id="instagram"
                          value={eventForm.instagram_link}
                          onChange={(e) => setEventForm(prev => ({ ...prev, instagram_link: e.target.value }))}
                          placeholder="https://instagram.com/..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="feedback">Feedback Form Link (Google Form)</Label>
                        <Input
                          id="feedback"
                          value={eventForm.feedback_link}
                          onChange={(e) => setEventForm(prev => ({ ...prev, feedback_link: e.target.value }))}
                          placeholder="https://forms.google.com/..."
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Event Image</Label>
                      <div className="flex gap-4 items-start">
                        {eventForm.image_url && (
                          <img src={eventForm.image_url} alt="Preview" className="w-24 h-24 object-cover rounded" />
                        )}
                        <div className="flex-1">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                            disabled={uploading}
                          />
                          {uploading && <p className="text-sm text-muted-foreground mt-1">Uploading...</p>}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setEventDialogOpen(false)}>Cancel</Button>
                    <Button onClick={saveEvent} className="gap-2">
                      <Save className="w-4 h-4" />
                      {editingEventId ? 'Update Event' : 'Create Event'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {events.map(event => (
                <Card key={event.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-3 h-12 rounded-full"
                        style={{ backgroundColor: event.bg_color }}
                      />
                      <div>
                        <h3 className="font-semibold">{event.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(event.date).toLocaleDateString()} • {event.time} • {event.venue}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={event.status === 'upcoming' ? 'default' : 'secondary'}>
                        {event.status}
                      </Badge>
                      <Button variant="ghost" size="icon" onClick={() => editEvent(event)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteEvent(event.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {events.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No events yet. Create your first event!</p>
              )}
            </div>
          </TabsContent>

          {/* News Tab */}
          <TabsContent value="news" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">All News</h2>
              <Dialog open={newsDialogOpen} onOpenChange={(open) => {
                setNewsDialogOpen(open);
                if (!open) {
                  setNewsForm(defaultNews);
                  setEditingNewsId(null);
                }
              }}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add News
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingNewsId ? 'Edit News' : 'Create News'}</DialogTitle>
                    <DialogDescription>Fill in the news details below.</DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="news-title">Title *</Label>
                      <Input
                        id="news-title"
                        value={newsForm.title}
                        onChange={(e) => setNewsForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="News headline"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="news-content">Content *</Label>
                      <Textarea
                        id="news-content"
                        value={newsForm.content}
                        onChange={(e) => setNewsForm(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="News content"
                        rows={4}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="news-date">Date</Label>
                        <Input
                          id="news-date"
                          type="date"
                          value={newsForm.date}
                          onChange={(e) => setNewsForm(prev => ({ ...prev, date: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Card Color</Label>
                        <Select
                          value={newsForm.bg_color}
                          onValueChange={(value) => {
                            const accent = bgColorOptions.find(o => o.value === value);
                            setNewsForm(prev => ({ 
                              ...prev, 
                              bg_color: value,
                              accent_color: accent ? accent.color : prev.accent_color 
                            }));
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {bgColorOptions.map(opt => (
                              <SelectItem key={opt.value} value={opt.value}>
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 rounded" style={{ backgroundColor: opt.color }} />
                                  {opt.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setNewsDialogOpen(false)}>Cancel</Button>
                    <Button onClick={saveNews} className="gap-2">
                      <Save className="w-4 h-4" />
                      {editingNewsId ? 'Update News' : 'Create News'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {news.map(item => (
                <Card key={item.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-3 h-12 rounded-full"
                        style={{ backgroundColor: item.accent_color }}
                      />
                      <div>
                        <h3 className="font-semibold">{item.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">{item.content}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {new Date(item.date).toLocaleDateString()}
                      </span>
                      <Button variant="ghost" size="icon" onClick={() => editNews(item)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteNews(item.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {news.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No news yet. Create your first news item!</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
