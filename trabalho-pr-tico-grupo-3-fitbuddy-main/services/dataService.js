const timeRegex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;

export const toBrazilDateString = (date) => {
  if (!date) return '';
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
};

export function toIsoDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseBrazilOrIsoDate(raw) {
  if (raw === null || raw === undefined || raw === '') return null;

  // Date object
  if (raw instanceof Date) {
    if (Number.isNaN(raw.getTime())) return { error: 'Data inválida' };
    return toIsoDateString(raw);
  }

  if (typeof raw !== 'string') return { error: 'Tipo de data inválido' };

  const s = raw.trim();

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const dt = new Date(`${s}T00:00:00Z`);
    if (Number.isNaN(dt.getTime())) return { error: 'Data inválida' };
    return toIsoDateString(dt);
  }

  // DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
    const [dd, mm, yyyy] = s.split('/');
    const iso = `${yyyy}-${mm.padStart(2,'0')}-${dd.padStart(2,'0')}`;
    const dt = new Date(`${iso}T00:00:00Z`);
    if (Number.isNaN(dt.getTime())) return { error: 'Data inválida' };
    return toIsoDateString(dt);
  }

  // ISO or other parseable
  const parsed = new Date(s);
  if (!Number.isNaN(parsed.getTime())) return toIsoDateString(parsed);

  return { error: 'Formato de data não reconhecido. Use DD/MM/YYYY ou YYYY-MM-DD ou ISO.' };
}

// parsePotentialDate — copie a função do seu ProfileScreen ou exporte-a também caso queira reutilizar
export const parsePotentialDate = (value) => {
  if (!value && value !== 0) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === 'string') {
    const isoMatch = /^\d{4}-\d{2}-\d{2}$/.test(value);
    const brMatch = /^\d{2}\/\d{2}\/\d{4}$/.test(value);
    if (isoMatch) {
      const d = new Date(`${value}T00:00:00Z`);
      return Number.isNaN(d.getTime()) ? null : d;
    }
    if (brMatch) {
      const [dd, mm, yy] = value.split('/');
      const iso = `${yy}-${mm}-${dd}`;
      const d = new Date(`${iso}T00:00:00Z`);
      return Number.isNaN(d.getTime()) ? null : d;
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
};


module.exports = {
    parseBrazilOrIsoDate,
    parsePotentialDate,
    toIsoDateString,
    toBrazilDateString
}