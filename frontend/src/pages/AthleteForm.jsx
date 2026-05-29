import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, Navigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { ArrowLeft, Save } from 'lucide-react';

const SPORT_POSITIONS = {
  basketball: [
    'Point Guard (PG)',
    'Shooting Guard (SG)',
    'Small Forward (SF)',
    'Power Forward (PF)',
    'Center (C)',
    'Combo Guard',
    'Stretch Four',
  ],
  football: [
    'Quarterback (QB)',
    'Running Back (RB)',
    'Wide Receiver (WR)',
    'Tight End (TE)',
    'Offensive Lineman (OL)',
    'Defensive Lineman (DL)',
    'Linebacker (LB)',
    'Defensive Back (DB)',
    'Kicker (K)',
    'Punter (P)',
  ],
  volleyball: [
    'Setter',
    'Outside Hitter (OH)',
    'Middle Blocker (MB)',
    'Opposite Hitter (OPP)',
    'Libero',
    'Defensive Specialist',
  ],
  swimming: [
    'Freestyle Specialist',
    'Backstroke Specialist',
    'Breaststroke Specialist',
    'Butterfly Specialist',
    'Individual Medley (IM)',
    'Sprint Freestyle',
    'Distance Freestyle',
  ],
  athletics: [
    'Sprinter (100m-400m)',
    'Middle Distance (800m-1500m)',
    'Long Distance (5000m+)',
    'Hurdles',
    'Jump Events (Long/Triple/High/Pole)',
    'Throw Events (Shot/Discus/Javelin)',
    'Multi-Events (Decathlon/Heptathlon)',
  ],
  badminton: [
    'Singles',
    'Doubles',
    'Mixed Doubles',
  ],
  tennis: [
    'Singles',
    'Doubles',
    'Mixed Doubles',
  ],
};

const AthleteForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = !!id;

  // Redirect admins - they shouldn't manage athletes
  if (user?.role === 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  // Check if user is athlete trying to edit someone else's profile
  // (this is also enforced backend but we check frontend for UX)

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
const [formData, setFormData] = useState({
    dateOfBirth: '',
    gender: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    emergencyContact: {
      name: '',
      relationship: '',
      phone: '',
      email: ''
    },
    academic: {
      studentId: '',
      major: '',
      minor: '',
      year: 1,
      gpa: 0,
      creditsCompleted: 0,
      totalCredits: 120,
      adviser: {
        name: '',
        email: '',
        phone: '',
        department: '',
      },
    },
    physical: {
      height: '',
      weight: '',
      bodyFat: '',
    },
    medical: {
      bloodType: '',
      allergies: [],
      medications: []
    },
    sport: {
      primary: '',
      secondary: [],
      position: '',
    },
    information: {
      bio: '',
      goals: '',
      achievements: '',
      additionalNotes: '',
    },
  });

  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (isEdit) {
        try {
          const res = await api.get(`/athletes/${id}`);
          setFormData(res.data);
        } catch (error) {
          console.error('Failed to fetch athlete:', error);
        }
      } else {
        // Only fetch users list for admin/coach/sport_coordinator
        if (user?.role !== 'athlete') {
          try {
            const res = await api.get('/users');
            setUsers(res.data.users || []);
          } catch (error) {
            console.error('Failed to fetch users:', error);
          }
        }
      }
      setInitialLoading(false);
    };
    fetchData();
  }, [id, isEdit, user]);

  const handleChange = (e, section = null) => {
    const { name, value } = e.target;
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [name]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleNestedChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Remove userId from payload if athlete is submitting
      const submitData = { ...formData };
      if (user?.role === 'athlete') {
        delete submitData.userId;
      }
      
      if (isEdit) {
        await api.put(`/athletes/${id}`, submitData);
      } else {
        await api.post('/athletes', submitData);
      }
      // Athletes should go to my-profile after creating or editing their profile
      if (user?.role === 'athlete') {
        navigate('/my-profile');
      } else {
        navigate('/athletes');
      }
    } catch (error) {
      console.error('Failed to save athlete:', error);
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
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex items-center gap-2 sm:gap-4">
        <Link to="/athletes">
          <button className="p-2 hover:bg-slate-100 rounded-lg touch-manipulation">
            <ArrowLeft size={20} />
          </button>
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
            Profile
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <Card title="Personal Information">
          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            {!isEdit && user?.role !== 'athlete' && (
              <div>
                <label className="text-sm font-medium text-slate-700">User Account</label>
                <select
                  name="userId"
                  value={formData.userId}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full px-3 py-2.5 sm:px-4 sm:py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                >
                  <option value="">Select User Account</option>
                  {users.map(u => (
                    <option key={u._id} value={u._id}>
                      {u.firstName} {u.lastName} ({u.email})
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Input
                label="Date of Birth"
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
              />
              <div>
                <label className="text-sm font-medium text-slate-700">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="mt-1 w-full px-3 py-2.5 sm:px-4 sm:py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <Input
              label="Street Address"
              name="street"
              value={formData.address.street}
              onChange={(e) => handleNestedChange('address', 'street', e.target.value)}
            />
            <Input
              label="City"
              name="city"
              value={formData.address.city}
              onChange={(e) => handleNestedChange('address', 'city', e.target.value)}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Input
                label="Emergency Contact Name"
                name="emergencyName"
                value={formData.emergencyContact.name}
                onChange={(e) => handleNestedChange('emergencyContact', 'name', e.target.value)}
              />
              <Input
                label="Emergency Contact Phone"
                name="emergencyPhone"
                value={formData.emergencyContact.phone}
                onChange={(e) => handleNestedChange('emergencyContact', 'phone', e.target.value)}
              />
            </div>
          </div>
        </Card>

<Card title="Academic Information">
          <div className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Input
                label="Student ID"
                name="studentId"
                value={formData.academic.studentId}
                onChange={(e) => handleNestedChange('academic', 'studentId', e.target.value)}
              />
              <Input
                label="Major"
                name="major"
                value={formData.academic.major}
                onChange={(e) => handleNestedChange('academic', 'major', e.target.value)}
              />
              <Input
                label="Minor"
                name="minor"
                value={formData.academic.minor}
                onChange={(e) => handleNestedChange('academic', 'minor', e.target.value)}
              />
              <div>
                <label className="text-sm font-medium text-slate-700">Year Level</label>
                <select
                  name="year"
                  value={formData.academic.year}
                  onChange={(e) => handleNestedChange('academic', 'year', parseInt(e.target.value))}
                  className="mt-1 w-full px-3 py-2.5 sm:px-4 sm:py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                >
                  <option value={1}>Year 1</option>
                  <option value={2}>Year 2</option>
                  <option value={3}>Year 3</option>
                  <option value={4}>Year 4</option>
                </select>
              </div>
              <Input
                label="GPA"
                type="number"
                name="gpa"
                step="0.01"
                max="4.0"
                value={formData.academic.gpa}
                onChange={(e) => handleNestedChange('academic', 'gpa', parseFloat(e.target.value))}
              />
              <Input
                label="Credits Completed"
                type="number"
                name="creditsCompleted"
                value={formData.academic.creditsCompleted}
                onChange={(e) => handleNestedChange('academic', 'creditsCompleted', parseInt(e.target.value))}
              />
            </div>

            <div className="border-t border-slate-200 pt-3 sm:pt-4">
              <h4 className="text-sm font-semibold text-slate-700 mb-2 sm:mb-3">Academic Adviser</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <Input
                  label="Adviser Name"
                  name="adviserName"
                  value={formData.academic.adviser?.name || ''}
                  onChange={(e) => handleNestedChange('academic', 'adviser', { ...formData.academic.adviser, name: e.target.value })}
                  placeholder="Enter adviser's full name"
                />
                <Input
                  label="Adviser Email"
                  type="email"
                  name="adviserEmail"
                  value={formData.academic.adviser?.email || ''}
                  onChange={(e) => handleNestedChange('academic', 'adviser', { ...formData.academic.adviser, email: e.target.value })}
                  placeholder="adviser@university.edu"
                />
                <Input
                  label="Adviser Phone"
                  name="adviserPhone"
                  value={formData.academic.adviser?.phone || ''}
                  onChange={(e) => handleNestedChange('academic', 'adviser', { ...formData.academic.adviser, phone: e.target.value })}
                  placeholder="+63 912 345 6789"
                />
                <Input
                  label="Department"
                  name="adviserDepartment"
                  value={formData.academic.adviser?.department || ''}
                  onChange={(e) => handleNestedChange('academic', 'adviser', { ...formData.academic.adviser, department: e.target.value })}
                  placeholder="e.g., Department of Physics"
                />
              </div>
            </div>
          </div>
        </Card>

        <Card title="Sport Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Primary Sport</label>
              <select
                name="primary"
                value={formData.sport.primary}
                onChange={(e) => handleNestedChange('sport', 'primary', e.target.value)}
                className="mt-1 w-full px-3 py-2.5 sm:px-4 sm:py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              >
                <option value="">Select Sport</option>
                <option value="basketball">Basketball</option>
                <option value="volleyball">Volleyball</option>
                <option value="football">Football</option>
                <option value="swimming">Swimming</option>
                <option value="athletics">Athletics</option>
                <option value="badminton">Badminton</option>
                <option value="tennis">Tennis</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Position</label>
              <select
                name="position"
                value={formData.sport.position}
                onChange={(e) => handleNestedChange('sport', 'position', e.target.value)}
                className="mt-1 w-full px-3 py-2.5 sm:px-4 sm:py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              >
                <option value="">Select Position</option>
                {formData.sport.primary && SPORT_POSITIONS[formData.sport.primary] ? (
                  SPORT_POSITIONS[formData.sport.primary].map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))
                ) : (
                  <option value="">Select a sport first</option>
                )}
              </select>
            </div>
           </div>
        </Card>

        <Card title="Information">
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Bio</label>
              <textarea
                name="bio"
                value={formData.information.bio}
                onChange={(e) => handleNestedChange('information', 'bio', e.target.value)}
                placeholder="Enter a brief biography"
                rows={3}
                className="mt-1 w-full px-3 py-2.5 sm:px-4 sm:py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Goals</label>
              <textarea
                name="goals"
                value={formData.information.goals}
                onChange={(e) => handleNestedChange('information', 'goals', e.target.value)}
                placeholder="Enter athletic or academic goals"
                rows={3}
                className="mt-1 w-full px-3 py-2.5 sm:px-4 sm:py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Achievements</label>
              <textarea
                name="achievements"
                value={formData.information.achievements}
                onChange={(e) => handleNestedChange('information', 'achievements', e.target.value)}
                placeholder="Enter notable achievements"
                rows={3}
                className="mt-1 w-full px-3 py-2.5 sm:px-4 sm:py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Additional Notes</label>
              <textarea
                name="additionalNotes"
                value={formData.information.additionalNotes}
                onChange={(e) => handleNestedChange('information', 'additionalNotes', e.target.value)}
                placeholder="Enter any additional notes"
                rows={3}
                className="mt-1 w-full px-3 py-2.5 sm:px-4 sm:py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              />
            </div>
          </div>
        </Card>

        <Card title="Physical Statistics">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Input
              label="Height (cm)"
              type="number"
              name="height"
              value={formData.physical.height}
              onChange={(e) => handleNestedChange('physical', 'height', parseFloat(e.target.value))}
            />
            <Input
              label="Weight (kg)"
              type="number"
              name="weight"
              value={formData.physical.weight}
              onChange={(e) => handleNestedChange('physical', 'weight', parseFloat(e.target.value))}
            />
          </div>
        </Card>

        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 sticky bottom-0 bg-white pt-3 pb-4 -mx-4 sm:mx-0 px-4 sm:px-0">
          <Link to="/athletes" className="w-full sm:w-auto">
            <Button type="button" variant="outline" className="w-full">Cancel</Button>
          </Link>
          <Button type="submit" loading={loading} className="w-full sm:w-auto flex items-center justify-center gap-2">
            <Save size={18} />
            {isEdit ? 'Update Profile' : 'Create Profile'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AthleteForm;
