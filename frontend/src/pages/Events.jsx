import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { api } from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { Calendar, Plus, Edit, Trash2, Eye, Clock, MapPin, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Events = () => {
  const { user } = useAuth();

  // Admin cannot access event management
  if (user?.role === 'admin') {
    return <Navigate to="/users" replace />;
  }

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchEvents();
  }, [filter]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/events');
      const data = res.data;
      setEvents(Array.isArray(data) ? data : data.events || []);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      await api.delete(`/events/${id}`);
      fetchEvents();
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  };

  const filteredEvents = (Array.isArray(events) ? events : []).filter(event => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return new Date(event.startTime) > new Date();
    if (filter === 'past') return new Date(event.startTime) < new Date();
    return event.type === filter;
  });

  const getEventTypeColor = (type) => {
    const colors = {
      competition: 'bg-red-100 text-red-700',
      practice: 'bg-blue-100 text-blue-700',
      meeting: 'bg-purple-100 text-purple-700',
      tournament: 'bg-amber-100 text-amber-700'
    };
    return colors[type] || 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Events</h1>
          <p className="text-slate-500">Manage events and schedules</p>
        </div>
        <Link to="/events/add">
          <Button className="flex items-center gap-2">
            <Plus size={18} /> Add Event
          </Button>
        </Link>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['all', 'upcoming', 'past', 'competition', 'practice', 'meeting', 'tournament'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              filter === f 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <Card>
        {loading ? (
          <div className="text-center py-8 text-slate-500">Loading...</div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Calendar size={48} className="mx-auto mb-4 text-slate-300" />
            <p>No events found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map(event => (
              <div key={event._id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{event.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {new Date(event.startTime).toLocaleDateString()}
                      </span>
                      {event.location && (
                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
                          {event.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getEventTypeColor(event.type)}`}>
                    {event.type}
                  </span>
                  <div className="flex items-center gap-1">
                    <Link to={`/events/${event._id}`}>
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Eye size={18} />
                      </button>
                    </Link>
                    <Link to={`/events/${event._id}/edit`}>
                      <button className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg">
                        <Edit size={18} />
                      </button>
                    </Link>
                    <button 
                      onClick={() => handleDelete(event._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Events;
