import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  LogOut,
  Calendar,
  Search,
  Filter,
  RefreshCw,
  Download,
  ChevronRight,
  X,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Event } from '../types/database';

export function DashboardPage() {
  const { user, adminUser, signOut } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [scraping, setScraping] = useState(false);

  const [filters, setFilters] = useState({
    city: 'Sydney',
    status: 'all',
    search: '',
    dateFrom: '',
    dateTo: '',
  });

  useEffect(() => {
    loadEvents();
  }, [filters]);

  async function loadEvents() {
    try {
      setLoading(true);
      let query = supabase.from('events').select('*');

      if (filters.city !== 'all') {
        query = query.eq('city', filters.city);
      }

      if (filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,venue_name.ilike.%${filters.search}%`
        );
      }

      if (filters.dateFrom) {
        query = query.gte('date_time', filters.dateFrom);
      }

      if (filters.dateTo) {
        query = query.lte('date_time', filters.dateTo);
      }

      query = query.order('date_time', { ascending: true });

      const { data, error } = await query;

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleScrapeEvents() {
    setScraping(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scrape-events`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) throw new Error('Scraping failed');

      const result = await response.json();
      console.log('Scraping result:', result);
      await loadEvents();
    } catch (error) {
      console.error('Error scraping events:', error);
      alert('Failed to scrape events. Please try again.');
    } finally {
      setScraping(false);
    }
  }

  async function handleImportEvent(event: Event, notes: string) {
    try {
      const { error } = await supabase
        .from('events')
        .update({
          status: 'imported',
          imported_at: new Date().toISOString(),
          imported_by: user?.id,
          import_notes: notes || null,
        })
        .eq('id', event.id);

      if (error) throw error;

      await loadEvents();
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error importing event:', error);
      alert('Failed to import event. Please try again.');
    }
  }

  const getStatusColor = (status: Event['status']) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-700';
      case 'updated':
        return 'bg-yellow-100 text-yellow-700';
      case 'inactive':
        return 'bg-gray-100 text-gray-700';
      case 'imported':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calendar className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Event Dashboard</h1>
                <p className="text-sm text-gray-600">Manage and import events</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {adminUser && (
                <div className="flex items-center space-x-3">
                  {adminUser.avatar_url && (
                    <img
                      src={adminUser.avatar_url}
                      alt={adminUser.full_name || 'User'}
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <span className="text-sm font-medium text-gray-700">
                    {adminUser.full_name || adminUser.email}
                  </span>
                </div>
              )}
              <button
                onClick={signOut}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filters
            </h2>
            <button
              onClick={handleScrapeEvents}
              disabled={scraping}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${scraping ? 'animate-spin' : ''}`} />
              <span>{scraping ? 'Scraping...' : 'Scrape Events'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <select
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="Sydney">Sydney</option>
                <option value="all">All Cities</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="updated">Updated</option>
                <option value="inactive">Inactive</option>
                <option value="imported">Imported</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date From</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date To</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  placeholder="Search..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Events ({events.length})
              </h2>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-600">Try adjusting your filters or scrape new events</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Venue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Source
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {events.map((event) => (
                    <tr
                      key={event.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{event.title}</div>
                        <div className="text-sm text-gray-500">{event.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(event.date_time)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{event.venue_name || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{event.city}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{event.source_website}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            event.status
                          )}`}
                        >
                          {event.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(event);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {selectedEvent && (
        <EventDetailPanel
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onImport={handleImportEvent}
        />
      )}
    </div>
  );
}

interface EventDetailPanelProps {
  event: Event;
  onClose: () => void;
  onImport: (event: Event, notes: string) => void;
}

function EventDetailPanel({ event, onClose, onImport }: EventDetailPanelProps) {
  const [importNotes, setImportNotes] = useState('');
  const [importing, setImporting] = useState(false);

  const handleImport = async () => {
    setImporting(true);
    await onImport(event, importNotes);
    setImporting(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-xl z-50 overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Event Details</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        {event.image_url && (
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-48 object-cover rounded-lg"
          />
        )}

        <div>
          <h4 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h4>
          <span
            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
              event.status === 'new'
                ? 'bg-blue-100 text-blue-700'
                : event.status === 'updated'
                ? 'bg-yellow-100 text-yellow-700'
                : event.status === 'inactive'
                ? 'bg-gray-100 text-gray-700'
                : 'bg-green-100 text-green-700'
            }`}
          >
            {event.status}
          </span>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-gray-500">Date & Time</p>
            <p className="text-sm text-gray-900">{formatDate(event.date_time)}</p>
          </div>

          {event.venue_name && (
            <div>
              <p className="text-sm font-medium text-gray-500">Venue</p>
              <p className="text-sm text-gray-900">{event.venue_name}</p>
              {event.venue_address && (
                <p className="text-sm text-gray-600">{event.venue_address}</p>
              )}
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-gray-500">City</p>
            <p className="text-sm text-gray-900">{event.city}</p>
          </div>

          {event.category && (
            <div>
              <p className="text-sm font-medium text-gray-500">Category</p>
              <p className="text-sm text-gray-900">{event.category}</p>
            </div>
          )}

          {event.description && (
            <div>
              <p className="text-sm font-medium text-gray-500">Description</p>
              <p className="text-sm text-gray-900">{event.description}</p>
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-gray-500">Source</p>
            <a
              href={event.original_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              {event.source_website}
              <Download className="w-3 h-3 ml-1" />
            </a>
          </div>

          {event.tags && event.tags.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">Tags</p>
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {event.last_scraped_at && (
            <div>
              <p className="text-sm font-medium text-gray-500">Last Scraped</p>
              <p className="text-sm text-gray-900">
                {formatDate(event.last_scraped_at)}
              </p>
            </div>
          )}

          {event.imported_at && (
            <div>
              <p className="text-sm font-medium text-gray-500">Imported</p>
              <p className="text-sm text-gray-900">{formatDate(event.imported_at)}</p>
              {event.import_notes && (
                <p className="text-sm text-gray-600 mt-1">{event.import_notes}</p>
              )}
            </div>
          )}
        </div>

        {event.status !== 'imported' && event.status !== 'inactive' && (
          <div className="pt-4 border-t border-gray-200 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Import Notes (Optional)
              </label>
              <textarea
                value={importNotes}
                onChange={(e) => setImportNotes(e.target.value)}
                placeholder="Add any notes about this import..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                rows={3}
              />
            </div>

            <button
              onClick={handleImport}
              disabled={importing}
              className="w-full py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
            >
              {importing ? 'Importing...' : 'Import to Platform'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
