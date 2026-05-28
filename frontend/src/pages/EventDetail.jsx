import { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { api } from '../services/api';
import Card from '../components/common/Card';
import { ArrowLeft, MapPin, Clock, Calendar, Edit } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const EventDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();

  // Admin cannot view event details
  if (user?.role === 'admin') {
    return <Navigate to="/users" replace />;
  }

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await api.get(`/events/${id}`);
        setEvent(res.data);
      } catch (error) {
        console.error('Failed to fetch event:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const getEventTypeColor = (type) => {
    const colors = {
      competition: 'bg-red-100 text-red-700',
      practice: 'bg-blue-100 text-blue-700',
      meeting: 'bg-purple-100 text-purple-700',
      tournament: 'bg-amber-100 text-amber-700'
    };
    return colors[type] || 'bg-slate-100 text-slate-700';
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="p-6">
        <div className="text-center py-12 text-slate-500">Event not found</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/events">
            <button className="p-2 hover:bg-slate-100 rounded-lg">
              <ArrowLeft size={20} />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{event.title}</h1>
            <p className="text-slate-500">Event Details</p>
          </div>
        </div>
        <Link to={`/events/${id}/edit`}>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Edit size={18} />
            Edit Event
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Event Information">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Type</span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getEventTypeColor(event.type)}`}>
                {event.type}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Sport</span>
              <span className="font-medium text-slate-800 capitalize">{event.sport || 'All Sports'}</span>
            </div>
            {event.teamId && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Team</span>
                <span className="font-medium text-slate-800">{event.teamId.name}</span>
              </div>
            )}
            {event.description && (
              <div>
                <span className="text-slate-500 block mb-1">Description</span>
                <p className="text-slate-800">{event.description}</p>
              </div>
            )}
          </div>
        </Card>

        <Card title="Schedule & Location">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Calendar className="text-slate-400" size={18} />
              <div>
                <p className="text-slate-800">{new Date(event.startTime).toLocaleDateString()}</p>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Clock size={14} />
                  {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {event.endTime && (
                    <> - {new Date(event.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</>
                  )}
                </div>
              </div>
            </div>
            {event.location && (
              <div className="flex items-center gap-3">
                <MapPin className="text-slate-400" size={18} />
                <div>
                  <p className="text-slate-800">{event.location}</p>
                  {event.address && <p className="text-sm text-slate-500">{event.address}</p>}
                </div>
              </div>
            )}
            {event.isAllDay && (
              <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm">
                All Day Event
              </span>
            )}
          </div>
        </Card>

        {event.notes && (
          <Card title="Notes">
            <p className="text-slate-800 whitespace-pre-wrap">{event.notes}</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EventDetail;
