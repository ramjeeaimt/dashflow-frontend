import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from '../../../components/ui/Header';
import Sidebar from '../../../components/ui/Sidebar';
import BreadcrumbNavigation from '../../../components/ui/BreadcrumbNavigation';
import useAuthStore from '../../../store/useAuthStore';
import { isAdminUser, isSystemAdmin, hasRole, ROLES, hasNonEmployeeRole } from '../../../config/roles';
import holidayService from '../../../services/holiday.service';
import HolidayStats from '../components/HolidayStats';
import HolidayMonthCalendar from '../components/HolidayMonthCalendar';
import HolidayListView from '../components/HolidayListView';
import HolidayModal from '../components/HolidayModal';
import ImportPresetsModal from '../components/ImportPresetsModal';
import DeleteHolidayModal from '../components/DeleteHolidayModal';
import {
  CalendarDays,
  Calendar as CalendarIcon,
  List,
  Plus,
  Download,
  FileSpreadsheet,
  Printer,
  Sparkles,
  RefreshCw,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';

const HolidayCalendarPage = () => {
  const { user } = useAuthStore();

  // Sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Active view: 'calendar' or 'list'
  const [viewMode, setViewMode] = useState('calendar');

  // Selected Year: defaults to current year
  const currentYearNum = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYearNum);

  // Holiday Data & Loading
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [holidayToEdit, setHolidayToEdit] = useState(null);
  const [defaultDateForModal, setDefaultDateForModal] = useState('');

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [holidayToDelete, setHolidayToDelete] = useState(null);

  // Determine if user has admin/management rights for holidays
  const isSuper = isSystemAdmin(user);
  const isCompanyAdmin = isSuper || isAdminUser(user);
  const isManagerOrHr =
    hasRole(user, ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.MANAGER, ROLES.HR_MANAGER) ||
    hasNonEmployeeRole(user);
  const canManageHolidays = isCompanyAdmin || isManagerOrHr;

  const companyId =
    (typeof user?.company === 'object' ? user?.company?.id : user?.company) ||
    user?.companyId ||
    user?.company_id;
  const companyName = user?.company?.name || 'Company';

  // Fetch holidays
  const fetchHolidays = useCallback(async () => {
    if (!companyId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await holidayService.getHolidays(companyId);
      setHolidays(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load holidays:', err);
      toast.error('Failed to load holidays');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchHolidays();
  }, [fetchHolidays]);

  // Handle Add Holiday
  const handleOpenAddModal = (dateStr = '') => {
    setHolidayToEdit(null);
    setDefaultDateForModal(dateStr || `${selectedYear}-01-01`);
    setIsHolidayModalOpen(true);
  };

  // Handle Edit Holiday
  const handleOpenEditModal = (holiday) => {
    setHolidayToEdit(holiday);
    setIsHolidayModalOpen(true);
  };

  // Handle Save Holiday (Add, Range, or Update)
  const handleSaveHoliday = async (form) => {
    if (!companyId) return;
    try {
      if (form.isRange && form.dates && form.dates.length > 0) {
        const existingHolidays = holidays || [];
        const newDatesSet = new Set(form.dates);

        // Keep existing holidays outside of this range
        const retained = existingHolidays.filter((h) => !newDatesSet.has(h.date));

        // Create an entry for each date in the range
        const newItems = form.dates.map((d, idx) => ({
          id: `hol_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
          name: form.name,
          date: d,
          type: form.type || 'full',
          category: form.category || 'Festival',
          description: form.description || '',
        }));

        const merged = [...retained, ...newItems].sort((a, b) => (a.date > b.date ? 1 : -1));
        await holidayService.bulkSaveHolidays(companyId, merged);
        toast.success(`Added ${newItems.length} holiday dates for "${form.name}"!`);
      } else if (form.id) {
        await holidayService.updateHoliday(companyId, form.id, form);
        toast.success(`Updated "${form.name}"`);
      } else {
        await holidayService.addHoliday(companyId, form);
        toast.success(`Added "${form.name}"`);
      }
      await fetchHolidays();
    } catch (err) {
      console.error('Save holiday error:', err);
      toast.error(err?.response?.data?.message || 'Failed to save holiday');
      throw err;
    }
  };

  // Handle Delete Holiday
  const handleOpenDeleteModal = (holiday) => {
    setHolidayToDelete(holiday);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (holiday) => {
    if (!companyId || !holiday) return;
    try {
      const idToDelete = holiday.id || holiday.date;
      await holidayService.deleteHoliday(companyId, idToDelete);
      toast.success(`Removed "${holiday.name}"`);
      await fetchHolidays();
    } catch (err) {
      console.error('Delete holiday error:', err);
      toast.error('Failed to delete holiday');
      throw err;
    }
  };

  // Handle Bulk Import Presets
  const handleImportPresets = async (selectedPresets) => {
    if (!companyId) {
      toast.error('Company ID not found. Please refresh or re-login.');
      return;
    }
    if (!selectedPresets || !selectedPresets.length) return;
    try {
      // Merge with existing holidays without duplicating dates
      const existingDateSet = new Set((holidays || []).map((h) => h.date));
      const newItems = selectedPresets
        .filter((p) => !existingDateSet.has(p.date))
        .map((p, idx) => ({
          ...p,
          id: `hol_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
        }));

      const merged = [...(holidays || []), ...newItems].sort((a, b) => (a.date > b.date ? 1 : -1));
      await holidayService.bulkSaveHolidays(companyId, merged);
      toast.success(`Imported ${newItems.length} holidays for ${selectedYear}!`);
      await fetchHolidays();
    } catch (err) {
      console.error('Import presets error:', err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to import holiday presets';
      toast.error(msg);
      throw err;
    }
  };

  // Export handlers
  const handleExportICS = () => {
    const yearHolidays = holidays.filter((h) => h.date && h.date.startsWith(`${selectedYear}-`));
    if (yearHolidays.length === 0) {
      toast.error(`No holidays configured for ${selectedYear}`);
      return;
    }
    holidayService.downloadICS(yearHolidays, `${companyName}_${selectedYear}`);
    toast.success('Calendar (.ics) downloaded! You can import this into Google Calendar or Apple Calendar.');
  };

  const handleExportCSV = () => {
    const yearHolidays = holidays.filter((h) => h.date && h.date.startsWith(`${selectedYear}-`));
    if (yearHolidays.length === 0) {
      toast.error(`No holidays configured for ${selectedYear}`);
      return;
    }
    holidayService.downloadCSV(yearHolidays, `${companyName}_${selectedYear}`);
    toast.success('Holidays CSV exported');
  };

  const breadcrumbs = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Holiday Calendar', path: '/holiday-calendar' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      <main
        className={`transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'
        } pt-16 pb-12`}
      >
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
          {/* Breadcrumb & Header Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <BreadcrumbNavigation items={breadcrumbs} />
              <div className="flex items-center gap-2.5 mt-1">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-display font-semibold tracking-tight text-foreground">
                    Holiday Calendar
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Official company holidays, public observances, and festive celebrations
                  </p>
                </div>
              </div>
            </div>

            {/* Top Toolbar Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Year Selector */}
              <div className="flex items-center rounded-xl border border-border bg-card px-2.5 py-1.5 shadow-2xs">
                <span className="text-xs text-muted-foreground mr-2 font-medium">Year:</span>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="text-xs font-bold bg-transparent text-foreground focus:outline-none cursor-pointer"
                >
                  {[currentYearNum - 1, currentYearNum, currentYearNum + 1, currentYearNum + 2].map((yr) => (
                    <option key={yr} value={yr} className="bg-card text-foreground">
                      {yr}
                    </option>
                  ))}
                </select>
              </div>

              {/* View Toggle */}
              <div className="flex items-center rounded-xl border border-border bg-card p-0.5 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setViewMode('calendar')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    viewMode === 'calendar'
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title="Month Calendar View"
                >
                  <CalendarIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Calendar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    viewMode === 'list'
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title="Agenda / List View"
                >
                  <List className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">List</span>
                </button>
              </div>

              {/* Export Button (ICS / CSV) */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleExportICS}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-border bg-card hover:bg-muted text-foreground transition-colors flex items-center gap-1.5 shadow-2xs"
                  title="Download .ics file to add to Google Calendar or Apple Calendar"
                >
                  <Download className="w-3.5 h-3.5 text-primary" />
                  <span className="hidden sm:inline">Sync Calendar</span> (.ics)
                </button>
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="p-2 text-xs font-semibold rounded-xl border border-border bg-card hover:bg-muted text-foreground transition-colors shadow-2xs"
                  title="Export to CSV Spreadsheet"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>

              {/* Admin Actions: Presets and Add Holiday */}
              {canManageHolidays && (
                <>
                  <button
                    type="button"
                    onClick={() => setIsImportModalOpen(true)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-purple-300 dark:border-purple-800 bg-purple-500/10 text-purple-700 dark:text-purple-300 hover:bg-purple-500/20 transition-colors flex items-center gap-1.5 shadow-2xs"
                    title="Import standard national and festival holidays"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Import Presets</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenAddModal()}
                    className="px-4 py-1.5 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Holiday</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Stats Bar */}
          <HolidayStats holidays={holidays} selectedYear={selectedYear} />

          {/* Quick Setup Banner when no holidays are configured */}
          {!loading && holidays.length === 0 && canManageHolidays && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-500/10 via-primary/5 to-transparent border border-purple-200 dark:border-purple-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-300 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Populate Official Holidays & Festivals for {selectedYear}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Load common festivals (Diwali, Holi, Republic Day, Eid, Christmas, etc.) so attendance, leaves, and payroll automatically calculate paid days off.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(true)}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition-colors flex items-center gap-1.5 shrink-0 shadow-xs"
              >
                <Sparkles className="w-4 h-4" />
                <span>Import Common Festivals</span>
              </button>
            </div>
          )}

          {/* Main Content Area */}
          {loading ? (
            <div className="bg-card border border-border rounded-2xl p-16 flex flex-col items-center justify-center text-center shadow-xs">
              <RefreshCw className="w-8 h-8 text-primary animate-spin mb-3" />
              <p className="text-sm font-semibold text-foreground">Loading holidays...</p>
              <p className="text-xs text-muted-foreground">Fetching official calendar dates</p>
            </div>
          ) : viewMode === 'calendar' ? (
            <HolidayMonthCalendar
              holidays={holidays}
              selectedYear={selectedYear}
              isAdmin={canManageHolidays}
              onAddHoliday={handleOpenAddModal}
              onEditHoliday={handleOpenEditModal}
              onDeleteHoliday={handleOpenDeleteModal}
            />
          ) : (
            <HolidayListView
              holidays={holidays}
              selectedYear={selectedYear}
              isAdmin={canManageHolidays}
              onEditHoliday={handleOpenEditModal}
              onDeleteHoliday={handleOpenDeleteModal}
            />
          )}
        </div>
      </main>

      {/* Modals */}
      <HolidayModal
        isOpen={isHolidayModalOpen}
        onClose={() => setIsHolidayModalOpen(false)}
        onSave={handleSaveHoliday}
        holidayToEdit={holidayToEdit}
        defaultDate={defaultDateForModal}
        selectedYear={selectedYear}
      />

      <ImportPresetsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        existingHolidays={holidays}
        selectedYear={selectedYear}
        onImport={handleImportPresets}
      />

      <DeleteHolidayModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        holiday={holidayToDelete}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default HolidayCalendarPage;

