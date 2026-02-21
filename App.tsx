import React, { useState, useEffect, useMemo } from 'react';
import { Birthday, Settings, Category } from './types';
import { isToday, getDaysUntil, calculateAge, formatDate, getMonthName, getMonthFromDateString } from './utils/dateUtils';
import { getSuggestedEmoji } from './services/geminiService';
import useLocalStorage from './hooks/useLocalStorage';
import { Plus, Search, Calendar as CalendarIcon, Settings as SettingsIcon, Trash2, Edit2, X, Bell, Moon, Sun, Gift, AlertCircle, List, Download, MessageCircle } from 'lucide-react';

// Sub-components
interface BirthdayCardProps {
  birthday: Birthday;
  highlight: boolean;
  onEdit: () => void;
  onDelete: (e: React.MouseEvent) => void;
  compact?: boolean;
}

const BirthdayCard: React.FC<BirthdayCardProps> = ({ birthday, highlight, onEdit, onDelete, compact }) => {
  const daysLeft = getDaysUntil(birthday.date);
  const age = calculateAge(birthday.date);
  const isBdayToday = isToday(birthday.date);

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const numbers = value.replace(/\D/g, '');
    
    // Limit to 11 digits
    const truncated = numbers.slice(0, 11);
    
    // Apply mask (99) 9 9999-9999
    if (truncated.length <= 2) return truncated.replace(/^(\d{0,2})/, '($1');
    if (truncated.length <= 3) return truncated.replace(/^(\d{2})(\d{0,1})/, '($1) $2');
    if (truncated.length <= 7) return truncated.replace(/^(\d{2})(\d{1})(\d{0,4})/, '($1) $2 $3');
    return truncated.replace(/^(\d{2})(\d{1})(\d{4})(\d{0,4})/, '($1) $2 $3-$4');
  };

  const handleWhatsappClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (birthday.whatsapp) {
      const cleanNumber = birthday.whatsapp.replace(/\D/g, '');
      const message = `Feliz aniversário, ${birthday.name}! 🎉🎂 Tudo de bom hoje e sempre!`;
      // Always prepend 55 for Brazil if not present (assuming local numbers)
      const fullNumber = cleanNumber.startsWith('55') && cleanNumber.length > 11 ? cleanNumber : `55${cleanNumber}`;
      const url = `https://wa.me/${fullNumber}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
    }
  };

  if (compact) {
    return (
      <div 
        onClick={onEdit}
        className={`relative group flex items-center gap-3 p-3 rounded-2xl cursor-pointer active:scale-[0.98] transition-all ${highlight ? 'bg-indigo-50 dark:bg-indigo-900/40 ring-1 ring-indigo-200 dark:ring-indigo-800' : 'bg-white dark:bg-gray-800 shadow-sm hover:shadow-md'}`}
      >
        <div className={`w-10 h-10 flex items-center justify-center text-xl rounded-xl flex-shrink-0 ${highlight ? 'bg-indigo-100 dark:bg-indigo-800' : 'bg-gray-50 dark:bg-gray-700'}`}>
          {birthday.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">{birthday.name}</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(birthday.date)}</p>
        </div>
        <div className="flex items-center gap-2">
          {birthday.whatsapp && (
             <button
              onClick={handleWhatsappClick}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 transition-colors"
              title="Enviar mensagem"
            >
              <MessageCircle size={14} />
            </button>
          )}
          <div className="text-right">
             <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${highlight ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300'}`}>
              {age}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={onEdit}
      className={`relative group p-5 rounded-3xl transition-all border-none cursor-pointer active:scale-[0.98] ${highlight ? 'bg-indigo-50 dark:bg-indigo-900/40 ring-1 ring-indigo-200 dark:ring-indigo-800' : 'bg-white dark:bg-gray-800 shadow-sm hover:shadow-md'}`}
    >
      <div className="flex justify-between items-start">
        <div className="flex gap-4">
          <div className={`w-12 h-12 flex items-center justify-center text-2xl rounded-2xl ${highlight ? 'bg-indigo-100 dark:bg-indigo-800' : 'bg-gray-50 dark:bg-gray-700'}`}>
            {birthday.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-lg leading-tight text-gray-900 dark:text-white truncate">{birthday.name}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(birthday.date)}</p>
            {birthday.observation && <p className="text-xs text-gray-400 dark:text-gray-500 italic mt-1 truncate">{birthday.observation}</p>}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <div className="flex items-center gap-2">
            {birthday.whatsapp && (
              <button 
                onClick={handleWhatsappClick}
                className="w-7 h-7 flex items-center justify-center bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
                title="Enviar WhatsApp"
              >
                <MessageCircle size={14} />
              </button>
            )}
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${highlight ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300'}`}>
              {age} anos
            </span>
          </div>
          <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
            {isBdayToday ? '🎈 Hoje!' : `Faltam ${daysLeft} d`}
          </span>
        </div>
      </div>
      
      {/* Botão de Excluir - Área de toque otimizada */}
      <button 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDelete(e);
        }} 
        className="absolute -top-2 -right-2 w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-700 text-red-500 rounded-full shadow-lg border border-red-50 dark:border-red-900/20 active:bg-red-50 transition-colors z-10 opacity-0 group-hover:opacity-100 focus:opacity-100"
        title="Excluir"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};

const App: React.FC = () => {
  const [birthdays, setBirthdays] = useLocalStorage<Birthday[]>('niver_birthdays', []);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const [settings, setSettings] = useLocalStorage<Settings>('niver_settings', { 
    darkMode: false, 
    notificationsEnabled: true, 
    notifyDayBefore: false 
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<string | null>(null); // Estado para o modal de confirmação
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<{
    name: string;
    date: string;
    category: Category;
    observation: string;
    whatsapp: string;
  }>({
    name: '',
    date: '',
    category: 'Amigo',
    observation: '',
    whatsapp: '',
  });

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
      document.body.className = 'bg-gray-900 transition-colors duration-300';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.className = 'bg-gray-50 transition-colors duration-300';
    }
  }, [settings.darkMode]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const numbers = value.replace(/\D/g, '');
    
    // Limit to 11 digits
    const truncated = numbers.slice(0, 11);
    
    // Apply mask (99) 9 9999-9999
    if (truncated.length === 0) return '';
    if (truncated.length <= 2) return truncated.replace(/^(\d{0,2})/, '($1');
    if (truncated.length <= 3) return truncated.replace(/^(\d{2})(\d{0,1})/, '($1) $2');
    if (truncated.length <= 7) return truncated.replace(/^(\d{2})(\d{1})(\d{0,4})/, '($1) $2 $3');
    return truncated.replace(/^(\d{2})(\d{1})(\d{4})(\d{0,4})/, '($1) $2 $3-$4');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.date) return;
    setIsLoading(true);
    
    const suggestedEmoji = await getSuggestedEmoji(formData.name, formData.category, formData.observation);
    
    if (editingId) {
      setBirthdays(prev => prev.map(b => b.id === editingId ? { 
        ...b, 
        name: formData.name, 
        date: formData.date, 
        category: formData.category, 
        observation: formData.observation, 
        whatsapp: formData.whatsapp,
        emoji: suggestedEmoji 
      } : b));
    } else {
      const newBirthday: Birthday = { 
        id: (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
        name: formData.name, 
        date: formData.date, 
        category: formData.category, 
        observation: formData.observation, 
        whatsapp: formData.whatsapp,
        emoji: suggestedEmoji 
      };
      setBirthdays(prev => [...prev, newBirthday]);
    }
    
    setIsLoading(false);
    resetForm();
    setIsModalOpen(false);
  };

  const resetForm = () => {
    setFormData({ name: '', date: '', category: 'Amigo', observation: '', whatsapp: '' });
    setEditingId(null);
  };

  const confirmDelete = () => {
    if (idToDelete) {
      setBirthdays(prev => prev.filter(b => b.id !== idToDelete));
      setIdToDelete(null);
      if (editingId === idToDelete) {
        setIsModalOpen(false);
        resetForm();
      }
    }
  };

  const startEdit = (b: Birthday) => {
    setFormData({ 
      name: b.name, 
      date: b.date, 
      category: b.category, 
      observation: b.observation || '',
      whatsapp: b.whatsapp || ''
    });
    setEditingId(b.id);
    setIsModalOpen(true);
  };

  const filteredBirthdays = useMemo(() => birthdays.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase())), [birthdays, searchQuery]);
  const sortedBirthdays = useMemo(() => [...filteredBirthdays].sort((a, b) => getDaysUntil(a.date) - getDaysUntil(b.date)), [filteredBirthdays]);

  // Group by month for calendar view
  const birthdaysByMonth = useMemo(() => {
    const grouped = Array(12).fill(null).map(() => [] as Birthday[]);
    filteredBirthdays.forEach(b => {
      const month = getMonthFromDateString(b.date);
      grouped[month].push(b);
    });
    // Sort each month by day
    grouped.forEach(monthList => {
      monthList.sort((a, b) => {
        const dayA = parseInt(a.date.split('-')[2]);
        const dayB = parseInt(b.date.split('-')[2]);
        return dayA - dayB;
      });
    });
    return grouped;
  }, [filteredBirthdays]);

  const todayBirthdays = sortedBirthdays.filter(b => isToday(b.date));
  const upcoming7Days = sortedBirthdays.filter(b => !isToday(b.date) && getDaysUntil(b.date) <= 7);
  const upcoming30Days = sortedBirthdays.filter(b => getDaysUntil(b.date) > 7 && getDaysUntil(b.date) <= 30);
  const otherBirthdays = sortedBirthdays.filter(b => getDaysUntil(b.date) > 30);

  return (
    <div className={`min-h-screen pb-24 dark:text-white`}>
      <header className="sticky top-0 z-20 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-md px-6 pt-10 pb-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center gap-2 dark:text-white">
            ReyNiver <span className="text-indigo-500">🎂</span>
          </h1>
          <div className="flex gap-2">
            <button 
              onClick={() => setViewMode(prev => prev === 'list' ? 'calendar' : 'list')} 
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-white"
              title={viewMode === 'list' ? "Ver Calendário" : "Ver Lista"}
            >
              {viewMode === 'list' ? <CalendarIcon size={24} /> : <List size={24} />}
            </button>
            <button onClick={() => setIsSettingsOpen(true)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-white">
              <SettingsIcon size={24} />
            </button>
          </div>
        </div>

        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
          <input 
            type="text"
            placeholder="Buscar por nome..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-none shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>
      </header>

      <main className="px-6 space-y-8 mt-4">
        {birthdays.length === 0 && (
          <div className="py-20 flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-500">
              <Gift size={40} />
            </div>
            <h2 className="text-xl font-medium text-gray-900 dark:text-white">Nenhum aniversário</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xs">Toque no "+" para começar.</p>
          </div>
        )}

        {viewMode === 'list' ? (
          <>
            {todayBirthdays.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Hoje 🎉</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {todayBirthdays.map(b => (
                    <BirthdayCard key={b.id} birthday={b} highlight onEdit={() => startEdit(b)} onDelete={() => setIdToDelete(b.id)} />
                  ))}
                </div>
              </div>
            )}

            {upcoming7Days.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Próximos 7 dias</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcoming7Days.map(b => (
                    <BirthdayCard key={b.id} birthday={b} highlight={false} onEdit={() => startEdit(b)} onDelete={() => setIdToDelete(b.id)} />
                  ))}
                </div>
              </div>
            )}

            {upcoming30Days.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Próximos 30 dias</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcoming30Days.map(b => (
                    <BirthdayCard key={b.id} birthday={b} highlight={false} onEdit={() => startEdit(b)} onDelete={() => setIdToDelete(b.id)} />
                  ))}
                </div>
              </div>
            )}

            {otherBirthdays.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Outros</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {otherBirthdays.map(b => (
                    <BirthdayCard key={b.id} birthday={b} highlight={false} onEdit={() => startEdit(b)} onDelete={() => setIdToDelete(b.id)} />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-8">
            {birthdaysByMonth.map((monthList, index) => {
              if (monthList.length === 0) return null;
              return (
                <div key={index} className="space-y-3">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white capitalize sticky top-40 bg-gray-50/90 dark:bg-gray-900/90 backdrop-blur-sm py-2 z-10 -mx-2 px-2 rounded-lg">
                    {getMonthName(index)}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {monthList.map(b => (
                      <BirthdayCard key={b.id} birthday={b} highlight={isToday(b.date)} onEdit={() => startEdit(b)} onDelete={() => setIdToDelete(b.id)} compact />
                    ))}
                  </div>
                </div>
              );
            })}
            {filteredBirthdays.length === 0 && searchQuery && (
              <p className="text-center text-gray-500">Nenhum resultado encontrado.</p>
            )}
          </div>
        )}
      </main>


      <button onClick={() => { resetForm(); setIsModalOpen(true); }} className="fixed bottom-8 right-8 w-16 h-16 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-xl flex items-center justify-center transition-transform active:scale-90 z-30">
        <Plus size={32} />
      </button>

      {/* Modal: Confirmação de Exclusão */}
      {idToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIdToDelete(null)} />
          <div className="relative w-full max-w-xs bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-6 text-center">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-500 mx-auto mb-4">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Excluir?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <button onClick={() => setIdToDelete(null)} className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium active:scale-95 transition-transform">Cancelar</button>
              <button onClick={confirmDelete} className="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium active:scale-95 transition-transform shadow-lg shadow-red-500/20">Excluir</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 transition-all overflow-hidden border border-transparent dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{editingId ? 'Editar' : 'Novo'} Aniversário</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"><X /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500 dark:text-gray-300">Nome</label>
                <input autoFocus required type="text" placeholder="Nome completo" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white border-none focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500 dark:text-gray-300">Data de Nascimento</label>
                <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white border-none focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500 dark:text-gray-300">Categoria</label>
                <div className="flex flex-wrap gap-2">
                  {(['Amigo', 'Família', 'Trabalho', 'Igreja', 'Outro'] as Category[]).map(cat => (
                    <button key={cat} type="button" onClick={() => setFormData({...formData, category: cat})} className={`px-3 py-1.5 rounded-full text-sm transition-colors ${formData.category === cat ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>{cat}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500 dark:text-gray-300">WhatsApp</label>
                <input 
                  type="tel" 
                  placeholder="(99) 9 9999-9999" 
                  value={formData.whatsapp} 
                  onChange={e => setFormData({...formData, whatsapp: formatPhoneNumber(e.target.value)})} 
                  className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white border-none focus:ring-2 focus:ring-indigo-500 outline-none" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500 dark:text-gray-300">Observação</label>
                <textarea placeholder="Opcional..." value={formData.observation} onChange={e => setFormData({...formData, observation: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white border-none focus:ring-2 focus:ring-indigo-500 outline-none min-h-[80px]" />
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <button type="submit" disabled={isLoading} className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-500/30 transition-all active:scale-[0.98]">
                  {isLoading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" /> : (editingId ? 'Salvar Alterações' : 'Criar Lembrete')}
                </button>
                {editingId && (
                  <button type="button" onClick={() => setIdToDelete(editingId)} className="w-full py-3 rounded-xl border border-red-100 dark:border-red-900/30 text-red-500 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex items-center justify-center gap-2">
                    <Trash2 size={18} /> Excluir
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Settings */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSettingsOpen(false)} />
          <div className="relative w-full max-w-sm bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-transparent dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Opções</h2>
              <button onClick={() => setIsSettingsOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"><X /></button>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {settings.darkMode ? <Moon size={20} className="text-indigo-400" /> : <Sun size={20} className="text-orange-400" />}
                  <span className="font-medium text-gray-900 dark:text-white">Modo Escuro</span>
                </div>
                <button onClick={() => setSettings({...settings, darkMode: !settings.darkMode})} className={`w-12 h-6 rounded-full relative transition-colors ${settings.darkMode ? 'bg-indigo-600' : 'bg-gray-300'}`}><div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.darkMode ? 'translate-x-6' : ''}`} /></button>
              </div>

              {deferredPrompt && (
                <button onClick={handleInstallClick} className="w-full py-3 rounded-xl bg-indigo-600 text-white font-medium flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-indigo-500/20">
                  <Download size={20} />
                  Instalar App
                </button>
              )}

              <div className="pt-4 border-t border-gray-100 dark:border-gray-700 text-center">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest">ReyNiver PWA v1.1</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
