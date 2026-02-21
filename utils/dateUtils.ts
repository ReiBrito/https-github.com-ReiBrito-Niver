
// Helper to parse YYYY-MM-DD as local date (midnight)
const parseDateString = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

// Helper to get current date in Brazil Timezone as a local Date object (midnight)
const getBrazilDateObj = (): Date => {
  const now = new Date();
  // en-CA format is YYYY-MM-DD
  const brazilDateStr = now.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
  return parseDateString(brazilDateStr);
};

export const calculateAge = (dateString: string): number => {
  const today = getBrazilDateObj();
  const birthDate = parseDateString(dateString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export const getDaysUntil = (dateString: string): number => {
  const today = getBrazilDateObj();
  const birthDate = parseDateString(dateString);
  
  const nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
  
  // If birthday has passed this year (in Brazil time), move to next year
  if (nextBirthday.getTime() < today.getTime()) {
    nextBirthday.setFullYear(today.getFullYear() + 1);
  }
  
  const diffTime = nextBirthday.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const isToday = (dateString: string): boolean => {
  const today = getBrazilDateObj();
  const birthDate = parseDateString(dateString);
  return today.getDate() === birthDate.getDate() && today.getMonth() === birthDate.getMonth();
};

export const formatDate = (dateString: string): string => {
  const date = parseDateString(dateString);
  return new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long' }).format(date);
};

export const getMonthName = (monthIndex: number): string => {
  return new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(new Date(2000, monthIndex, 1));
};

export const getMonthFromDateString = (dateString: string): number => {
  const [_, month] = dateString.split('-').map(Number);
  return month - 1; // 0-indexed
};
