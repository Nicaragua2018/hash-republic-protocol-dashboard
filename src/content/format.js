// "2026-10-11" → "11 de octubre de 2026". The date is read as local midnight
// so it never slips to the previous day in timezones west of UTC.
export const formatDate = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('es', { year: 'numeric', month: 'long', day: 'numeric' });
