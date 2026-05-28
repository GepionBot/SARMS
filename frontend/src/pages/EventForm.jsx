import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, Navigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { Save, ArrowLeft, Calendar as CalendarIcon, MapPin, Users } from 'lucide-react';

const EventForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = !!id;

  // Admin cannot create/edit events
  if (user?.role === 'admin') {
    return <Navigate to="/users" replace />;
  }

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [teams, setTeams] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'practice',
    sport: '',
    teamId: '',
    location: '',
    address: '',
    startTime: '',
    endTime: '',
    isAllDay: false,
    notes: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const teamsRes = await api.get('/teams');
        setTeams(teamsRes.data.teams || []);
      } catch (error) {
        console.error('Failed to fetch teams:', error);
      }

      if (isEdit) {
        try {
          const res = await api.get(`/events/${id}`);
          setFormData(res.data);
        } catch (error) {
          console.error('Failed to fetch event:', error);
        }
      }
      setInitialLoading(false);
    };
    fetchData();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/events/${id}`, formData);
      } else {
        await api.post('/events', formData);
      }
      navigate('/events');
    } catch (error) {
      console.error('Failed to save event:', error);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/events">
          <button className="p-2 hover:bg-slate-100 rounded-lg">
            <ArrowLeft size={20} />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {isEdit ? 'Edit Event' : 'Add New Event'}
          </h1>
          <p className="text-slate-500">
            {isEdit ? 'Update event information' : 'Create a new event'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card title="Event Details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Event Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
            <div>
              <label className="text-sm font-medium text-slate-700">Event Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="practice">Practice</option>
                <option value="competition">Competition</option>
                <option value="meeting">Meeting</option>
                <option value="tournament">Tournament</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Sport</label>
              <select
                name="sport"
                value={formData.sport}
                onChange={handleChange}
                className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Sports</option>
                <option value="basketball">Basketball</option>
                <option value="volleyball">Volleyball</option>
                <option value="football">Football</option>
                <option value="swimming">Swimming</option>
                <option value="athletics">Athletics</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Team</label>
              <select
                name="teamId"
                value={formData.teamId}
                onChange={handleChange}
                className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">No Team</option>
                {teams.map(team => (
                  <option key={team._id} value={team._id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </Card>

        <Card title="Schedule & Location">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Start Time"
              type="datetime-local"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              required
            />
            <Input
              label="End Time"
              type="datetime-local"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
            />
            <Input
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., Main Gym"
            />
            <Input
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Full address"
            />
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isAllDay"
                  checked={formData.isAllDay}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-700">All Day Event</span>
              </label>
            </div>
          </div>
        </Card>

        <Card title="Notes">
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={4}
            placeholder="Additional notes..."
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </Card>

        <div className="flex justify-end gap-4">
          <Link to="/events">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
          <Button type="submit" loading={loading} className="flex items-center gap-2">
            <Save size={18} />
            {isEdit ? 'Update Event' : 'Create Event'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EventForm;
