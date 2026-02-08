import { Calendar, MapPin, ExternalLink } from 'lucide-react';
import type { Event } from '../types/database';

interface EventCardProps {
  event: Event;
  onGetTickets: (event: Event) => void;
}

export function EventCard({ event, onGetTickets }: EventCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 border border-gray-100">
      {event.image_url && (
        <div className="h-48 overflow-hidden">
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-semibold text-gray-900 flex-1">{event.title}</h3>
          {event.status === 'new' && (
            <span className="ml-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
              New
            </span>
          )}
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-start text-gray-600">
            <Calendar className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
            <span className="text-sm">{formatDate(event.date_time)}</span>
          </div>
          {event.venue_name && (
            <div className="flex items-start text-gray-600">
              <MapPin className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
              <div className="text-sm">
                <div className="font-medium">{event.venue_name}</div>
                {event.venue_address && (
                  <div className="text-gray-500">{event.venue_address}</div>
                )}
              </div>
            </div>
          )}
        </div>

        {event.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">{event.description}</p>
        )}

        {event.category && (
          <div className="mb-4">
            <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
              {event.category}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center text-xs text-gray-500">
            <ExternalLink className="w-3 h-3 mr-1" />
            <span>{event.source_website}</span>
          </div>
          <button
            onClick={() => onGetTickets(event)}
            className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            GET TICKETS
          </button>
        </div>
      </div>
    </div>
  );
}
