import { Link } from 'react-router-dom';
import { GraduationCap, MapPin, Phone, Mail, Award } from 'lucide-react';
import Card from '../components/common/Card';

const About = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <GraduationCap className="text-blue-600" size={28} />
              <span className="font-bold text-xl text-slate-800">SARMS</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link 
                to="/about" 
                className="text-slate-600 hover:text-slate-800 font-medium"
              >
                About
              </Link>
              <Link 
                to="/login" 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-6">About SARMS</h1>
            <p className="text-xl text-blue-100">
              The Student-Athlete Record Management System (SARMS) is a comprehensive 
              web-based platform designed for ACLC College of Ormoc City, Inc. to 
              centralize and manage student-athlete academic and athletic records.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Our Mission</h2>
              <p className="text-slate-600 mb-6">
                We aim to replace traditional paper, spreadsheets, and social media 
                record-keeping with a secure, web-based platform that supports comprehensive 
                athlete profile management, academic eligibility tracking, athletic performance 
                records, and media galleries.
              </p>
              <p className="text-slate-600">
                SARMS provides role-based access control ensuring that coaches, sport 
                coordinators, and administrators have appropriate access to the information 
                they need while maintaining data security and privacy.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Contact Information</h2>
              <Card>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="text-blue-600 mt-1" size={20} />
                    <div>
                      <p className="font-medium text-slate-800">Address</p>
                      <p className="text-slate-500">ACLC College of Ormoc City, Inc.</p>
                      <p className="text-slate-500">Ormoc City, Leyte</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="text-blue-600 mt-1" size={20} />
                    <div>
                      <p className="font-medium text-slate-800">Phone</p>
                      <p className="text-slate-500">(Contact the college)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="text-blue-600 mt-1" size={20} />
                    <div>
                      <p className="font-medium text-slate-800">Email</p>
                      <p className="text-slate-500">admin@aclc-ormoc.edu.ph</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-8 text-center">System Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <Award className="text-blue-600 mb-4" size={32} />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Athlete Management</h3>
              <p className="text-slate-500">
                Comprehensive CRUD operations for athlete profiles including personal info, 
                sports participation, and performance stats.
              </p>
            </Card>
            <Card>
              <Award className="text-blue-600 mb-4" size={32} />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Academic Eligibility</h3>
              <p className="text-slate-500">
                Track and monitor academic standing with restricted editing privileges 
                for administrators only.
              </p>
            </Card>
            <Card>
              <Award className="text-blue-600 mb-4" size={32} />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Media Gallery</h3>
              <p className="text-slate-500">
                Upload and manage images, videos, and certificates with organized storage.
              </p>
            </Card>
            <Card>
              <Award className="text-blue-600 mb-4" size={32} />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Performance Tracking</h3>
              <p className="text-slate-500">
                Record game statistics and participation history with trend visualization.
              </p>
            </Card>
            <Card>
              <Award className="text-blue-600 mb-4" size={32} />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Reports & Analytics</h3>
              <p className="text-slate-500">
                Generate performance and eligibility reports with visual charts using Chart.js.
              </p>
            </Card>
            <Card>
              <Award className="text-blue-600 mb-4" size={32} />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Secure Access</h3>
              <p className="text-slate-500">
                JWT authentication with role-based access control and protected routes.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 text-slate-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; {new Date().getFullYear()} SARMS - ACLC College of Ormoc City, Inc.</p>
        </div>
      </footer>
    </div>
  );
};

export default About;
