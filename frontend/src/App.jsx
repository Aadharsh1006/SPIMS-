import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layouts
import StudentLayout from './layouts/StudentLayout';
import FacultyLayout from './layouts/FacultyLayout';
import TPOLayout from './layouts/TPOLayout';
import RecruiterLayout from './layouts/RecruiterLayout';
import SuperAdminLayout from './layouts/SuperAdminLayout';
import AlumniLayout from './layouts/AlumniLayout';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import ChatbotPanel from './components/ChatbotPanel';
import BroadcastBanner from './components/BroadcastBanner';
import ComingSoon from './components/ComingSoon';

// Shared / Public
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import PublicPortfolio from './pages/public/PublicPortfolio';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentJobs from './pages/student/StudentJobs';
import StudentApplications from './pages/student/StudentApplications';
import StudentMessages from './pages/student/StudentMessages';
import StudentProfilePage from './pages/student/StudentProfilePage';
import InterviewPrep from './pages/student/InterviewPrep';

// Faculty Pages
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import FacultyStudents from './pages/faculty/FacultyStudents'; // Fixed: Was StudentList
import FacultyApprovals from './pages/faculty/FacultyApprovals';
import FacultyMessages from './pages/faculty/FacultyMessages';
import FacultyJobs from './pages/faculty/FacultyJobs';

// TPO Pages
import TPODashboard from './pages/tpo/TPODashboard';
import TPOStudents from './pages/tpo/TPOStudents';
import TPOFaculties from './pages/tpo/TPOFaculties';
import TPOJobs from './pages/tpo/TPOJobs';
import TpoJobMarket from './pages/tpo/TpoJobMarket';
import TPOMessages from './pages/tpo/TPOMessages';
import TPOAnalytics from './pages/tpo/TPOAnalytics';
import TPOSettings from './pages/tpo/TPOSettings';
import TPOOnboarding from './pages/tpo/TPOOnboarding';
import TPOAlumni from './pages/tpo/ManageAlumni';

// Recruiter Pages
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import CreateJob from './pages/CreateJob';
import RecruiterJobs from './pages/recruiter/RecruiterJobs';
import RecruiterMessages from './pages/recruiter/RecruiterMessages';
import RecruiterAccessRequests from './pages/recruiter/RecruiterAccessRequests';
import RecruiterApplicants from './pages/recruiter/RecruiterApplicants';
import RecruiterProfile from './pages/recruiter/RecruiterProfile';

// Super Admin Pages
import SuperAdminAnalytics from './pages/superadmin/SuperAdminAnalytics';
import GlobalBroadcast from './pages/superadmin/GlobalBroadcast';
import ManageColleges from './pages/superadmin/ManageColleges';
import TPOManagement from './pages/superadmin/TPOManagement'; // Fixed: Was TpoManagement
import ManageRecruiters from './pages/superadmin/ManageRecruiters';
import SuperAdminMessages from './pages/superadmin/SuperAdminMessages';

// Alumni Pages
import AlumniDashboard from './pages/alumni/AlumniDashboard';
import AlumniMessages from './pages/alumni/AlumniMessages';
import AlumniNetwork from './pages/alumni/AlumniNetwork';
import AlumniProfile from './pages/alumni/AlumniProfile';

const GoogleCallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
  </div>
);

function App() {
  return (
    <div className="min-h-screen bg-slate-950">
      <BroadcastBanner />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/google/callback" element={<GoogleCallback />} />
        
        {/* Protected Student Routes */}
        <Route element={<ProtectedRoute roles={['STUDENT']} />}>
          <Route element={<StudentLayout />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/jobs" element={<StudentJobs />} />
            <Route path="/student/applications" element={<StudentApplications />} />
            <Route path="/student/messages" element={<StudentMessages />} />
            <Route path="/student/profile" element={<StudentProfilePage />} />
            <Route path="/student/interview-prep" element={<InterviewPrep />} />
            <Route index element={<Navigate to="/student/dashboard" replace />} />
          </Route>
        </Route>

        {/* Protected Faculty Routes */}
        <Route element={<ProtectedRoute roles={['FACULTY']} />}>
          <Route path="/faculty" element={<FacultyLayout />}>
            <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
            <Route path="/faculty/students" element={<FacultyStudents />} />
            <Route path="/faculty/approvals" element={<FacultyApprovals />} />
            <Route path="/faculty/messages" element={<FacultyMessages />} />
            <Route path="/faculty/jobs" element={<FacultyJobs />} />
            <Route index element={<Navigate to="/faculty/dashboard" replace />} />
          </Route>
        </Route>

        {/* Protected TPO Routes */}
        <Route element={<ProtectedRoute roles={['TPO']} />}>
          <Route path="/tpo" element={<TPOLayout />}>
            <Route path="/tpo/dashboard" element={<TPODashboard />} />
            <Route path="/tpo/students" element={<TPOStudents />} />
            <Route path="/tpo/faculties" element={<TPOFaculties />} />
            <Route path="/tpo/jobs" element={<TPOJobs />} />
            <Route path="/tpo/job-market" element={<TpoJobMarket />} />
            <Route path="/tpo/messages" element={<TPOMessages />} />
             <Route path="/tpo/analytics" element={<TPOAnalytics />} />
             <Route path="/tpo/settings" element={<TPOSettings />} />
             <Route path="/tpo/onboarding" element={<TPOOnboarding />} />
             <Route path="/tpo/alumni" element={<TPOAlumni />} />
             <Route index element={<Navigate to="/tpo/dashboard" replace />} />
          </Route>
        </Route>

        {/* Protected Recruiter Routes */}
        <Route element={<ProtectedRoute roles={['RECRUITER']} />}>
          <Route path="/recruiter" element={<RecruiterLayout />}>
            <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
            <Route path="/recruiter/create-job" element={<CreateJob />} />
             <Route path="/recruiter/jobs" element={<RecruiterJobs />} />
             <Route path="/recruiter/messages" element={<RecruiterMessages />} />
             <Route path="/recruiter/requests" element={<RecruiterAccessRequests />} />
              <Route path="/recruiter/applications" element={<RecruiterApplicants />} />
              <Route path="/recruiter/profile" element={<RecruiterProfile />} />
              <Route index element={<Navigate to="/recruiter/dashboard" replace />} />
          </Route>
        </Route>

        {/* Protected Super Admin Routes */}
        <Route element={<ProtectedRoute roles={['SUPER_ADMIN']} />}>
          <Route path="/superadmin" element={<SuperAdminLayout />}>
             <Route path="/superadmin/analytics" element={<SuperAdminAnalytics />} />
             <Route path="/superadmin/broadcasts" element={<GlobalBroadcast />} />
             <Route path="/superadmin/messages" element={<SuperAdminMessages />} />
            <Route path="/superadmin/colleges" element={<ManageColleges />} />
            <Route path="/superadmin/tpos" element={<TPOManagement />} />
            <Route path="/superadmin/recruiters" element={<ManageRecruiters />} />
            <Route index element={<Navigate to="/superadmin/colleges" replace />} />
          </Route>
        </Route>

        {/* Protected Alumni Routes */}
        <Route element={<ProtectedRoute roles={['ALUMNI']} />}>
          <Route path="/alumni" element={<AlumniLayout />}>
             <Route path="/alumni/dashboard" element={<AlumniDashboard />} />
             <Route path="/alumni/messages" element={<AlumniMessages />} />
             <Route path="/alumni/network" element={<AlumniNetwork />} />
             <Route path="/alumni/profile" element={<AlumniProfile />} />
             <Route index element={<Navigate to="/alumni/dashboard" replace />} />
          </Route>
        </Route>

        <Route path="/portfolio/:id" element={<PublicPortfolio />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <ChatbotPanel />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '1rem',
            fontSize: '14px',
            fontWeight: '600'
          },
        }}
      />
    </div>
  );
}

export default App;
