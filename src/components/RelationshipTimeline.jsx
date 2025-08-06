import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Calendar, Heart, Save, Upload, Download, Printer, Globe, Eye, Copy, Check, X, Edit2, Trash2 } from 'lucide-react';

const translations = {
  en: {
    title: 'Relationship Timeline',
    addEvent: 'Add Event',
    editEvent: 'Edit Event',
    eventDescription: 'Event Description',
    satisfactionScore: 'Satisfaction Score',
    date: 'Date',
    monthOnly: 'Month only',
    specificDay: 'Specific day',
    save: 'Save',
    cancel: 'Cancel',
    update: 'Update',
    events: 'Events',
    noEvents: 'No events yet. Add your first event above!',
    edit: 'Edit',
    delete: 'Delete',
    exportData: 'Export Data',
    importData: 'Import Data',
    print: 'Print',
    viewJSON: 'View JSON',
    copied: 'Copied!',
    copyJSON: 'Copy JSON',
    lineStyle: 'Line Style',
    curved: 'Curved',
    straight: 'Straight',
    satisfactionLevel: 'Satisfaction Level',
    timeline: 'Timeline',
    deleteConfirm: 'Are you sure you want to delete this event?',
    importSuccess: 'Data imported successfully!',
    importError: 'Error importing data. Please check the file format.',
    scoreGuide: {
      title: 'Score Guide',
      positive8: '+8: Extremely Happy',
      positive4: '+4: Very Happy',
      positive2: '+2: Happy',
      zero: '0: Neutral',
      negative2: '-2: Unhappy',
      negative4: '-4: Very Unhappy',
      negative8: '-8: Extremely Unhappy'
    }
  },
  hu: {
    title: 'Kapcsolat Idővonal',
    addEvent: 'Esemény Hozzáadása',
    editEvent: 'Esemény Szerkesztése',
    eventDescription: 'Esemény Leírása',
    satisfactionScore: 'Elégedettségi Pontszám',
    date: 'Dátum',
    monthOnly: 'Csak hónap',
    specificDay: 'Konkrét nap',
    save: 'Mentés',
    cancel: 'Mégse',
    update: 'Frissítés',
    events: 'Események',
    noEvents: 'Még nincsenek események. Add hozzá az elsőt fent!',
    edit: 'Szerkesztés',
    delete: 'Törlés',
    exportData: 'Adatok Exportálása',
    importData: 'Adatok Importálása',
    print: 'Nyomtatás',
    viewJSON: 'JSON Megtekintése',
    copied: 'Másolva!',
    copyJSON: 'JSON Másolása',
    lineStyle: 'Vonal Stílus',
    curved: 'Ívelt',
    straight: 'Egyenes',
    satisfactionLevel: 'Elégedettségi Szint',
    timeline: 'Idővonal',
    deleteConfirm: 'Biztosan törölni szeretnéd ezt az eseményt?',
    importSuccess: 'Adatok sikeresen importálva!',
    importError: 'Hiba az importálás során. Kérlek ellenőrizd a fájl formátumát.',
    scoreGuide: {
      title: 'Pontszám Útmutató',
      positive8: '+8: Rendkívül Boldog',
      positive4: '+4: Nagyon Boldog',
      positive2: '+2: Boldog',
      zero: '0: Semleges',
      negative2: '-2: Boldogtalan',
      negative4: '-4: Nagyon Boldogtalan',
      negative8: '-8: Rendkívül Boldogtalan'
    }
  }
};

const RelationshipTimeline = () => {
  const [events, setEvents] = useState([]);
  const [currentEvent, setCurrentEvent] = useState({
    description: '',
    score: 0,
    date: new Date().toISOString().split('T')[0],
    monthOnly: false
  });
  const [editingIndex, setEditingIndex] = useState(null);
  const [showJSON, setShowJSON] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lineType, setLineType] = useState('monotone');
  const [language, setLanguage] = useState('en');

  const t = translations[language];

  useEffect(() => {
    const savedEvents = localStorage.getItem('relationshipEvents');
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    }
    const savedLanguage = localStorage.getItem('appLanguage');
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('relationshipEvents', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('appLanguage', language);
  }, [language]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newEvent = {
      ...currentEvent,
      id: editingIndex !== null ? events[editingIndex].id : Date.now(),
      displayDate: currentEvent.monthOnly 
        ? currentEvent.date.substring(0, 7)
        : currentEvent.date
    };

    if (editingIndex !== null) {
      const updatedEvents = [...events];
      updatedEvents[editingIndex] = newEvent;
      setEvents(updatedEvents.sort((a, b) => new Date(a.date) - new Date(b.date)));
      setEditingIndex(null);
    } else {
      setEvents([...events, newEvent].sort((a, b) => new Date(a.date) - new Date(b.date)));
    }

    setCurrentEvent({
      description: '',
      score: 0,
      date: new Date().toISOString().split('T')[0],
      monthOnly: false
    });
  };

  const handleEdit = (index) => {
    setCurrentEvent(events[index]);
    setEditingIndex(index);
  };

  const handleDelete = (index) => {
    if (window.confirm(t.deleteConfirm)) {
      setEvents(events.filter((_, i) => i !== index));
    }
  };

  const handleCancel = () => {
    setCurrentEvent({
      description: '',
      score: 0,
      date: new Date().toISOString().split('T')[0],
      monthOnly: false
    });
    setEditingIndex(null);
  };

  const exportData = () => {
    const dataStr = JSON.stringify(events, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `relationship-timeline-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedEvents = JSON.parse(e.target.result);
          setEvents(importedEvents.sort((a, b) => new Date(a.date) - new Date(b.date)));
          alert(t.importSuccess);
        } catch (error) {
          alert(t.importError);
        }
      };
      reader.readAsText(file);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const copyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(events, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const chartData = events.map(event => ({
    date: event.displayDate,
    score: event.score,
    description: event.description
  }));

  const getScoreColor = (score) => {
    if (score > 4) return '#10b981';
    if (score > 0) return '#84cc16';
    if (score === 0) return '#6b7280';
    if (score > -4) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Heart className="text-pink-500" size={32} />
              <h1 className="text-3xl font-bold text-gray-800">{t.title}</h1>
            </div>
            <button
              onClick={() => setLanguage(language === 'en' ? 'hu' : 'en')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Globe size={20} />
              {language === 'en' ? 'HU' : 'EN'}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.eventDescription}
                </label>
                <input
                  type="text"
                  value={currentEvent.description}
                  onChange={(e) => setCurrentEvent({...currentEvent, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.satisfactionScore} ({currentEvent.score})
                </label>
                <input
                  type="range"
                  min="-8"
                  max="8"
                  value={currentEvent.score}
                  onChange={(e) => setCurrentEvent({...currentEvent, score: parseInt(e.target.value)})}
                  className="w-full"
                  style={{
                    background: `linear-gradient(to right, #ef4444 0%, #f59e0b 37.5%, #6b7280 50%, #84cc16 62.5%, #10b981 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>-8</span>
                  <span>0</span>
                  <span>+8</span>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline mr-2" size={16} />
                  {t.date}
                </label>
                <input
                  type={currentEvent.monthOnly ? "month" : "date"}
                  value={currentEvent.monthOnly ? currentEvent.date.substring(0, 7) : currentEvent.date}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCurrentEvent({
                      ...currentEvent, 
                      date: currentEvent.monthOnly ? value + '-01' : value
                    });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex items-end">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentEvent.monthOnly}
                    onChange={(e) => setCurrentEvent({...currentEvent, monthOnly: e.target.checked})}
                    className="rounded text-pink-500 focus:ring-pink-500"
                  />
                  <span className="text-sm text-gray-700">{t.monthOnly}</span>
                </label>
              </div>
            </div>

            <div className="flex gap-2">
              {editingIndex !== null ? (
                <>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                  >
                    <Check size={20} />
                    {t.update}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                  >
                    <X size={20} />
                    {t.cancel}
                  </button>
                </>
              ) : (
                <button
                  type="submit"
                  className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors flex items-center gap-2"
                >
                  <Save size={20} />
                  {t.addEvent}
                </button>
              )}
            </div>
          </form>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-700 mb-2">{t.scoreGuide.title}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>{t.scoreGuide.positive8}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-lime-500"></div>
                <span>{t.scoreGuide.positive4}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-lime-400"></div>
                <span>{t.scoreGuide.positive2}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                <span>{t.scoreGuide.zero}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <span>{t.scoreGuide.negative2}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span>{t.scoreGuide.negative4}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>{t.scoreGuide.negative8}</span>
              </div>
            </div>
          </div>
        </div>

        {events.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">{t.timeline}</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setLineType(lineType === 'monotone' ? 'linear' : 'monotone')}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
                >
                  {t.lineStyle}: {lineType === 'monotone' ? t.curved : t.straight}
                </button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  domain={[-8, 8]} 
                  stroke="#6b7280"
                  ticks={[-8, -6, -4, -2, 0, 2, 4, 6, 8]}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                  formatter={(value, name) => {
                    if (name === 'score') {
                      return [value, t.satisfactionLevel];
                    }
                    return [value, name];
                  }}
                />
                <Legend />
                <ReferenceLine y={0} stroke="#9ca3af" strokeDasharray="5 5" />
                <Line 
                  type={lineType}
                  dataKey="score" 
                  stroke="#ec4899" 
                  strokeWidth={3}
                  dot={{ fill: '#ec4899', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8 }}
                  name={t.satisfactionLevel}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{t.events}</h2>
          {events.length === 0 ? (
            <p className="text-gray-500 text-center py-8">{t.noEvents}</p>
          ) : (
            <div className="space-y-3">
              {events.map((event, index) => (
                <div 
                  key={event.id} 
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: getScoreColor(event.score) }}
                      ></div>
                      <span className="font-medium text-gray-800">{event.description}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span>{event.displayDate}</span>
                      <span className="font-medium" style={{ color: getScoreColor(event.score) }}>
                        {event.score > 0 ? '+' : ''}{event.score}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(index)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(index)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={exportData}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <Download size={20} />
              {t.exportData}
            </button>
            <label className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 cursor-pointer">
              <Upload size={20} />
              {t.importData}
              <input
                type="file"
                accept=".json"
                onChange={importData}
                className="hidden"
              />
            </label>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
            >
              <Printer size={20} />
              {t.print}
            </button>
            <button
              onClick={() => setShowJSON(!showJSON)}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
            >
              <Eye size={20} />
              {t.viewJSON}
            </button>
          </div>

          {showJSON && (
            <div className="mt-4 p-4 bg-gray-900 text-green-400 rounded-lg font-mono text-sm overflow-x-auto">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">JSON Data</span>
                <button
                  onClick={copyJSON}
                  className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors flex items-center gap-2"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? t.copied : t.copyJSON}
                </button>
              </div>
              <pre>{JSON.stringify(events, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @media print {
          .no-print {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default RelationshipTimeline;