import { Heart, Settings, Plus, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEvents, useTranslation } from '@/context/EventContext';

export default function AppHeader({ onAddEvent, onOpenSettings }) {
  const { language, setLanguage } = useEvents();
  const t = useTranslation();

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-card border-b border-border">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <Heart className="text-white" size={18} />
        </div>
        <h1 className="text-xl font-semibold text-foreground">{t.title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLanguage(language === 'en' ? 'hu' : 'en')}
        >
          <Globe size={16} />
          {language === 'en' ? 'HU' : 'EN'}
        </Button>
        <Button variant="ghost" size="icon" onClick={onOpenSettings}>
          <Settings size={18} />
        </Button>
        <Button variant="gradient" onClick={onAddEvent}>
          <Plus size={16} />
          {t.addEvent}
        </Button>
      </div>
    </header>
  );
}
