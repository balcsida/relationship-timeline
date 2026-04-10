import { useState, useRef } from 'react';
import { Download, Upload, Copy, Check, Eye, EyeOff } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { useEvents, useTranslation } from '@/context/EventContext';
import { exportEventsToJSON, validateImportedData } from '@/utils/eventUtils';

export default function SettingsDialog({ open, onOpenChange, onOpenPrint }) {
  const { events, lineType, setLineType, importEvents, clearEvents } = useEvents();
  const t = useTranslation();
  const [showJSON, setShowJSON] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const fileInputRef = useRef(null);

  const handleExport = () => {
    const { dataUri, filename } = exportEventsToJSON(events);
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', filename);
    link.click();
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (validateImportedData(data)) {
          importEvents(data);
          alert(t.importSuccess);
        } else {
          alert(t.importError);
        }
      } catch {
        alert(t.importError);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(events, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t.settings}</DialogTitle>
            <DialogDescription>{t.settings}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-foreground mb-2">{t.chartStyle}</h3>
              <div className="flex gap-2">
                <Button variant={lineType === 'monotone' ? 'default' : 'outline'} size="sm" onClick={() => setLineType('monotone')}>{t.curved}</Button>
                <Button variant={lineType === 'linear' ? 'default' : 'outline'} size="sm" onClick={() => setLineType('linear')}>{t.straight}</Button>
              </div>
            </div>
            <Separator />
            <div>
              <h3 className="text-sm font-medium text-foreground mb-2">{t.data}</h3>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={handleExport}><Download size={14} />{t.exportData}</Button>
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}><Upload size={14} />{t.importData}</Button>
                <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
                <Button variant="outline" size="sm" onClick={() => setShowJSON(!showJSON)}>
                  {showJSON ? <EyeOff size={14} /> : <Eye size={14} />}
                  {t.viewJSON}
                </Button>
              </div>
            </div>
            {showJSON && (
              <div className="bg-foreground/5 rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-muted-foreground">JSON</span>
                  <Button variant="ghost" size="sm" onClick={handleCopyJSON}>
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? t.copied : t.copyJSON}
                  </Button>
                </div>
                <ScrollArea className="h-[200px]">
                  <pre className="text-xs text-foreground font-mono">{JSON.stringify(events, null, 2)}</pre>
                </ScrollArea>
              </div>
            )}
            <Separator />
            <div>
              <Button variant="outline" size="sm" onClick={() => { onOpenChange(false); onOpenPrint(); }}>{t.printTimeline}</Button>
            </div>
            <Separator />
            <div>
              <h3 className="text-sm font-medium text-destructive mb-2">{t.dangerZone}</h3>
              <Button variant="destructive" size="sm" onClick={() => setShowClearConfirm(true)}>{t.clearAllEvents}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.clearConfirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>{t.clearConfirmDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={() => { clearEvents(); setShowClearConfirm(false); }}>{t.clearAllEvents}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
