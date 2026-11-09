import apiClient from '../api/client';
import useAuthStore from '../store/useAuthStore';

export const holidayService = {
  /**
   * Fetch company holidays
   */
  async getHolidays(companyId) {
    if (!companyId) return [];
    try {
      // 1. Try company details endpoint (always supported)
      const compRes = await apiClient.get(`/system-company/id/${companyId}`);
      const compData = compRes.data?.data || compRes.data;
      if (Array.isArray(compData?.holidays)) {
        return compData.holidays;
      }
    } catch (err) {
      console.warn('Fallback: checking /system-company/:id/holidays', err);
    }

    try {
      const res = await apiClient.get(`/system-company/${companyId}/holidays`);
      const data = res.data?.data || res.data;
      return Array.isArray(data) ? data : [];
    } catch (e) {
      console.error('Failed to get holidays:', e);
      return [];
    }
  },

  /**
   * Bulk save or import holidays
   * Uses PATCH /system-company/:id which is natively supported across all backend versions
   */
  async bulkSaveHolidays(companyId, holidays) {
    if (!companyId) throw new Error('Company ID is missing');

    const sanitized = (Array.isArray(holidays) ? holidays : [])
      .map((h, idx) => ({
        id: h.id || `hol_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
        name: String(h.name || '').trim(),
        date: String(h.date || ''),
        type: h.type === 'half' ? 'half' : 'full',
        description: h.description ? String(h.description).trim() : '',
        category: h.category || 'Festival',
      }))
      .filter((h) => h.name && h.date)
      .sort((a, b) => (a.date > b.date ? 1 : -1));

    try {
      // Native patch endpoint
      await apiClient.patch(`/system-company/${companyId}`, { holidays: sanitized });
      this._syncLocalUserHolidays(sanitized);
      return sanitized;
    } catch (err) {
      // Secondary fallback to dedicated PUT if available
      try {
        const res = await apiClient.put(`/system-company/${companyId}/holidays`, { holidays: sanitized });
        const result = res.data?.data || res.data;
        const list = Array.isArray(result) ? result : (result.holidays || sanitized);
        this._syncLocalUserHolidays(list);
        return list;
      } catch (fallbackErr) {
        console.error('bulkSaveHolidays failed:', err, fallbackErr);
        throw err;
      }
    }
  },

  /**
   * Add a single holiday
   */
  async addHoliday(companyId, holidayData) {
    if (!companyId) throw new Error('Company ID is missing');
    const existing = await this.getHolidays(companyId);

    const newHoliday = {
      id: `hol_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: holidayData.name.trim(),
      date: holidayData.date,
      type: holidayData.type || 'full',
      category: holidayData.category || 'Festival',
      description: holidayData.description?.trim() || '',
    };

    // Replace if same date exists, else append
    const updated = [
      ...existing.filter((h) => h.date !== holidayData.date),
      newHoliday,
    ].sort((a, b) => (a.date > b.date ? 1 : -1));

    await this.bulkSaveHolidays(companyId, updated);
    return { holiday: newHoliday, holidays: updated };
  },

  /**
   * Update an existing holiday
   */
  async updateHoliday(companyId, holidayId, holidayData) {
    if (!companyId) throw new Error('Company ID is missing');
    const existing = await this.getHolidays(companyId);

    const updated = existing.map((h) => {
      if (h.id === holidayId || h.date === holidayId) {
        return {
          ...h,
          ...holidayData,
          name: holidayData.name !== undefined ? holidayData.name.trim() : h.name,
          description: holidayData.description !== undefined ? holidayData.description?.trim() : h.description,
        };
      }
      return h;
    }).sort((a, b) => (a.date > b.date ? 1 : -1));

    await this.bulkSaveHolidays(companyId, updated);
    const target = updated.find((h) => h.id === holidayId || h.date === holidayId);
    return { holiday: target, holidays: updated };
  },

  /**
   * Delete a holiday by ID or date
   */
  async deleteHoliday(companyId, holidayId) {
    if (!companyId) throw new Error('Company ID is missing');
    const existing = await this.getHolidays(companyId);

    const updated = existing.filter((h) => h.id !== holidayId && h.date !== holidayId);
    await this.bulkSaveHolidays(companyId, updated);
    return { deletedId: holidayId, holidays: updated };
  },

  /**
   * Sync local user in AuthStore and localStorage
   */
  _syncLocalUserHolidays(holidaysList) {
    if (!Array.isArray(holidaysList)) return;
    try {
      const state = useAuthStore.getState();
      if (state.user) {
        const updatedUser = {
          ...state.user,
          company: {
            ...state.user.company,
            holidays: holidaysList,
          },
        };
        useAuthStore.setState({ user: updatedUser });
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (e) {
      console.warn('Could not sync local user holidays state', e);
    }
  },

  /**
   * Export to .ics
   */
  downloadICS(holidays, companyName = 'Company') {
    if (!holidays || holidays.length === 0) return;

    const pad = (n) => String(n).padStart(2, '0');
    const now = new Date();
    const dtStamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;

    let lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Dashflow HRM//Holiday Calendar//EN',
      'CALSCALE:GREGORIAN',
      `X-WR-CALNAME:${companyName} Holidays`,
    ];

    holidays.forEach((h) => {
      if (!h.date) return;
      const cleanDate = h.date.replace(/-/g, '');
      const uid = `holiday-${h.id || cleanDate}@dashflow.com`;
      const summary = `${h.name}${h.type === 'half' ? ' (Half-Day)' : ''}`;
      const desc = h.description || `${companyName} Official Holiday`;

      lines.push('BEGIN:VEVENT');
      lines.push(`UID:${uid}`);
      lines.push(`DTSTAMP:${dtStamp}`);
      lines.push(`DTSTART;VALUE=DATE:${cleanDate}`);
      lines.push(`SUMMARY:${summary}`);
      lines.push(`DESCRIPTION:${desc}`);
      lines.push('STATUS:CONFIRMED');
      lines.push('TRANSP:TRANSPARENT');
      lines.push('END:VEVENT');
    });

    lines.push('END:VCALENDAR');

    const icsContent = lines.join('\r\n');
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${companyName.toLowerCase().replace(/\s+/g, '_')}_holidays.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * Export to CSV
   */
  downloadCSV(holidays, companyName = 'Company') {
    if (!holidays || holidays.length === 0) return;

    const headers = ['Date', 'Day', 'Holiday Name', 'Type', 'Category', 'Description'];
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const rows = holidays.map((h) => {
      const d = new Date(h.date + 'T00:00:00');
      const dayName = isNaN(d.getTime()) ? '' : days[d.getDay()];
      const typeLabel = h.type === 'half' ? 'Half Day' : 'Full Day Paid';
      const cat = h.category || 'General';
      const desc = (h.description || '').replace(/"/g, '""');

      return `"${h.date}","${dayName}","${h.name.replace(/"/g, '""')}","${typeLabel}","${cat}","${desc}"`;
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${companyName.toLowerCase().replace(/\s+/g, '_')}_holidays.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};

export default holidayService;
