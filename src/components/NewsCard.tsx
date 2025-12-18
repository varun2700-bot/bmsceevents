interface News {
  id: string;
  title: string;
  content: string;
  date: string;
  accent_color: string;
  bg_color: string;
}

interface NewsCardProps {
  news: News;
}

export function NewsCard({ news }: NewsCardProps) {
  return (
    <div 
      className="p-5 rounded-lg shadow-md hover:shadow-lg transition-all border-l-4"
      style={{ 
        backgroundColor: news.bg_color,
        borderLeftColor: news.accent_color
      }}
    >
      <h3 className="font-bold text-base text-foreground mb-2">{news.title}</h3>
      <p className="text-xs text-muted-foreground font-semibold mb-2">
        {new Date(news.date).toLocaleDateString('en-US', { 
          month: 'short', day: 'numeric', year: 'numeric' 
        })}
      </p>
      <p className="text-sm text-foreground/80">{news.content}</p>
    </div>
  );
}
