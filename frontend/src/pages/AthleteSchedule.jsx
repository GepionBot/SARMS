import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { Plus, Calendar, Clock, MapPin, Users, Trash2, Edit, Save, X } from 'lucide-react';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

const SCHEDULE_TYPES = [
  { value: 'class', label: 'Class', color: '#3B82F6' },
  { value: 'study', label: 'Study Session', color: '#10B981' },
  { value: 'practice', label: 'Sports Practice', color: '#F59E0B' },
  { value: 'meeting', label: 'Meeting', color: '#8B5CF6' },
  { value: 'other', label: 'Other', color: '#6B7280' },
];

const EVENT_TYPES = [
  { value: 'competition', label: 'Competition', color: 'bg-red-100 text-red-700' },
  { value: 'practice', label: 'Practice', color: 'bg-blue-100 text-blue-700' },
  { value: 'meeting', label: 'Meeting', color: 'bg-purple-100 text-purple-700' },
  { value: 'tournament', label: 'Tournament', color: 'bg-amber-100 text-amber-700' },
];

const AthleteSchedule = () => {
  const { user } = useAuth();
  
  // Admins cannot access schedule management
  if (user?.role === 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  const [schedules, setSchedules] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('schedule');
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    type: 'class',
    dayOfWeek: 'monday',
    startTime: '',
    endTime: '',
    location: '',
    instructor: '',
    notes: '',
    color: '#3B82F6',
  });

  useEffect(() => {
    fetchSchedules();
    fetchEvents();
  }, []);

  const fetchSchedules = async () => {
    try {
      const res = await api.get('/schedules');
      setSchedules(res.data.schedules || []);
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      const data = res.data;
      setEvents(Array.isArray(data) ? data : data.events || []);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSchedule) {
        await api.put(`/schedules/${editingSchedule._id}`, formData);
      } else {
        await api.post('/schedules', formData);
      }
      setShowModal(false);
      setEditingSchedule(null);
      resetForm();
      fetchSchedules();
    } catch (error) {
      console.error('Failed to save schedule:', error);
      alert('Failed to save schedule');
    }
  };

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      title: schedule.title,
      type: schedule.type,
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      location: schedule.location || '',
      instructor: schedule.instructor || '',
      notes: schedule.notes || '',
      color: schedule.color || '#3B82F6',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this schedule?')) return;
    try {
      await api.delete(`/schedules/${id}`);
      fetchSchedules();
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Failed to delete schedule');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      type: 'class',
      dayOfWeek: 'monday',
      startTime: '',
      endTime: '',
      location: '',
      instructor: '',
      notes: '',
      color: '#3B82F6',
    });
  };

  const groupedSchedules = DAYS.reduce((acc, day) => {
    acc[day] = schedules.filter(s => s.dayOfWeek === day);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Schedule</h1>
          <p className="text-slate-500">Manage your school classes and activities</p>
        </div>
        {user?.role !== 'athlete' && (
          <Button className="flex items-center gap-2" onClick={() => { setShowModal(true); setEditingSchedule(null); resetForm(); }}>
            <Plus size={18} />
            Add Schedule
          </Button>
        )}
      </div>

      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'schedule' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          Weekly Schedule
        </button>
        {user?.role === 'athlete' && (
          <button
            onClick={() => setActiveTab('events')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'events' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            My Events
          </button>
        )}
      </div>

      {activeTab === 'schedule' && (
        <>
          {DAYS.map(day => (
            <Card key={day} title={DAY_LABELS[day]} subtitle={`${day.charAt(0).toUpperCase() + day.slice(1)} schedule`}>
              {groupedSchedules[day].length === 0 ? (
                <p className="text-slate-500 text-sm py-4">No schedules for {DAY_LABELS[day]}</p>
              ) : (
                <div className="space-y-3">
                  {groupedSchedules[day].map(schedule => (
                    <div key={schedule._id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors relative" style={{ borderLeft: `4px solid ${schedule.color}` }}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-slate-800">{schedule.title}</h4>
                            <span className="text-xs px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: schedule.color }}>
                              {SCHEDULE_TYPES.find(t => t.value === schedule.type)?.label || schedule.type}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-600 mb-2">
                            <span className="flex items-center gap-1">
                              <Clock size={14} />
                              {schedule.startTime} - {schedule.endTime}
                            </span>
                            {schedule.location && (
                              <span className="flex items-center gap-1">
                                <MapPin size={14} />
                                {schedule.location}
                              </span>
                            )}
                            {schedule.instructor && (
                              <span className="flex items-center gap-1">
                                <Users size={14} />
                                {schedule.instructor}
                              </span>
                            )}
                          </div>
                          {schedule.notes && (
                            <p className="text-sm text-slate-500 mt-2">{schedule.notes}</p>
                          )}
                        </div>
                        {user?.role !== 'athlete' && (
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleEdit(schedule)} className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                              <Edit size={16} />
                            </button>
                            <button onClick={() => handleDelete(schedule._id)} className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </>
      )}

      {activeTab === 'events' && user?.role === 'athlete' && (
        <Card title="My Events" subtitle="Upcoming sports events">
          {events.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Calendar size={48} className="mx-auto mb-4 text-slate-300" />
              <p>No events found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map(event => (
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
                  <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${EVENT_TYPES.find(t => t.value === event.type)?.color || 'bg-slate-100 text-slate-700'}`}>
                    {event.type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">
                {editingSchedule ? 'Edit Schedule' : 'Add New Schedule'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Title *"
                name="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Introduction to Physics"
                required
              />

              <div>
                <label className="text-sm font-medium text-slate-700">Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {SCHEDULE_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Day of Week</label>
                <select
                  name="dayOfWeek"
                  value={formData.dayOfWeek}
                  onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                  className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {DAYS.map(day => (
                    <option key={day} value={day}>{DAY_LABELS[day]}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Start Time *"
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  required
                />
                <Input
                  label="End Time *"
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  required
                />
              </div>

              <Input
                label="Location"
                name="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Science Building Room 101"
              />

              <Input
                label="Instructor"
                name="instructor"
                value={formData.instructor}
                onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                placeholder="e.g., Prof. Smith"
              />

              <Input
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes..."
              />

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Label Color</label>
                <div className="flex gap-2">
                  {['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#6B7280'].map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-8 h-8 rounded-full border-2 ${formData.color === color ? 'border-slate-800' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" className="flex items-center gap-2">
                  <Save size={18} />
                  {editingSchedule ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AthleteSchedule;
