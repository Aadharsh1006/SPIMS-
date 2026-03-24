// frontend/src/api/api.js
import axios from 'axios';

const rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
// Strip any trailing slash if it exists
const sanitizedBaseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

const api = axios.create({
    baseURL: sanitizedBaseUrl + '/api'
});

console.log('--- API CONNECTION DIAGNOSTIC ---');
console.log('Base URL:', api.defaults.baseURL);
console.log('-------------------------------');

api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authApi = {
    me: () => api.get('/auth/me'),
    login: (data) => api.post('/auth/login', data),
    devLogin: (data) => api.post('/auth/dev-login', data),
    register: (data) => api.post('/auth/register', data),
    changePassword: (newPassword) => api.post('/auth/change-password', { newPassword }),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    verifyOTP: (email, otp) => api.post('/auth/verify-otp', { email, otp }),
    resetPassword: (resetToken, newPassword) => api.post('/auth/reset-password', { resetToken, newPassword })
};

export const usersApi = {
    getStaff: () => api.get('/users/staff'),
    getStudents: () => api.get('/tpo/students'),
    getAlumni: () => api.get('/tpo/alumni'),
    toggleBookmark: (jobId) => api.patch(`/users/bookmarks/${jobId}`),
    getBroadcasts: () => api.get('/users/broadcasts')
};

export const dashboardApi = {
    getStudentDashboard: () => api.get('/dashboards/student/me'),
    getFacultyStats: () => api.get('/dashboards/faculty/overview'),
    getTpoDashboard: () => api.get('/dashboards/tpo/overview'),
    getRecruiterStats: () => api.get('/dashboards/recruiter/overview'),
    exportTpoData: () => api.get('/dashboards/tpo/export', { responseType: 'blob' })
};

export const jobsApi = {
    list: () => api.get('/jobs'),
    apply: (jobId, aiScoreData) => api.post(`/applications/${jobId}/apply`, aiScoreData)
};

export const applicationApi = {
    getStudentApplications: () => api.get('/applications/student/me'),
    apply: (jobId, aiScoreData) => api.post(`/applications/${jobId}/apply`, aiScoreData),
    getCollegeApplications: (status) => api.get(`/applications/college${status ? `?status=${status}` : ''}`),
    getJobApplicants: (jobId) => api.get(`/applications/job/${jobId}`),
    facultyApprove: (id, action) => api.post(`/applications/${id}/faculty-approve`, { action }),
    bulkFacultyApprove: (applicationIds, action) => api.post('/applications/bulk-faculty-approve', { applicationIds, action }),
    bulkRecruiterAction: (ids, action) => api.post('/applications/bulk-recruiter-action', { applicationIds: ids, action }),
    recruiterShortlist: (id) => api.post(`/applications/${id}/recruiter-shortlist`),
    recruiterOffer: (id) => api.post(`/applications/${id}/recruiter-offer`),
    recruiterFinalize: (id) => api.post(`/applications/${id}/recruiter-finalize`),
    respondToOffer: (id, decision) => api.post(`/applications/${id}/respond-to-offer`, { decision })
};

export const adminApi = {
    getColleges: () => api.get('/admin/colleges'),
    createCollege: (data) => api.post('/admin/colleges', data),
    createTpo: (data) => api.post('/admin/colleges/create-tpo', data),
    assignTpo: (collegeId, userId) => api.post(`/admin/colleges/${collegeId}/tpo`, { userId }),
    updateCollege: (id, data) => api.put(`/admin/colleges/${id}`, data),
    deleteCollege: (id) => api.delete(`/admin/colleges/${id}`),
    deleteTpo: (collegeId, userId) => api.delete(`/admin/colleges/${collegeId}/tpo/${userId}`),
    getPendingRecruiters: () => api.get('/admin/recruiters/pending'),
    approveRecruiter: (id) => api.patch(`/admin/recruiters/${id}/approve`),
    getAdminAnalytics: () => api.get('/admin/analytics'),
    sendBroadcast: (data) => api.post('/admin/broadcasts', data)
};

export const tpoApi = {
    getStudents: () => api.get('/tpo/students'),
    verifyStudent: (studentId, status) => api.patch(`/tpo/students/${studentId}/verify`, { status }),
    getFaculties: () => api.get('/tpo/faculties'),
    verifyFaculty: (facultyId, status) => api.patch(`/tpo/faculties/${facultyId}/verify`, { status }),
    getAlumni: () => api.get('/tpo/alumni'),
    verifyAlumni: (alumniId, status) => api.patch(`/tpo/alumni/${alumniId}/verify`, { status }),
    getConfig: () => api.get('/tpo/config'),
    updateConfig: (data) => api.post('/tpo/config', data),
    sendBroadcast: (data) => api.post('/tpo/broadcasts', data), // Corrected endpoint if needed
    getJobs: () => api.get('/jobs/tpo/list'),
    getGlobalJobs: () => api.get('/jobs/global'),
    requestAccess: (jobId) => api.post(`/jobs/${jobId}/request-access`),
    publishJob: (id) => api.patch(`/jobs/${id}/publish`),
    importStudents: (data) => api.post('/college/import/students', { students: data }),
    importFaculties: (data) => api.post('/college/import/faculties', { faculties: data }),
    assignFaculty: (data) => api.post('/college/assign-faculty', data),
    bulkVerify: (ids, status) => api.post('/tpo/bulk-verify', { ids, isActive: status })
};

export const recruiterApi = {
    getJobs: () => api.get('/jobs'),
    updateJob: (id, data) => api.put(`/jobs/${id}`, data),
    deleteJob: (id) => api.delete(`/jobs/${id}`),
    getAccessRequests: () => api.get('/jobs/requests'),
    approveAccess: (jobId, collegeId) => api.post(`/jobs/${jobId}/approve-access/${collegeId}`)
};

export const analyticsApi = {
    getTpoAnalytics: (params) => api.get('/analytics/tpo', { params }),
    getSkillGap: () => api.get('/analytics/skills/gap'),
    getStudentPerformance: (studentId) => api.get(`/analytics/student/${studentId}`),
    exportPlacements: () => api.get('/analytics/export/placements', { responseType: 'blob' })
};

export const messagingApi = {
    send: (data) => api.post('/messages/send', data),
    uploadAttachment: (formData) => api.post('/messages/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getHistory: (userId, type) => api.get(`/messages/conversation/${userId}/${type}`),
    getConversations: () => api.get('/messages/conversations')
};

export const alumniApi = {
    search: (params) => api.get('/alumni/search', { params }),
    getSuggestions: (jobId) => api.get(`/alumni/job/${jobId}/suggestions`)
};

export const resumeApi = {
    uploadFile: (formData) => api.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getMyResumes: () => api.get('/resumes/my'),
    getStudentResume: (studentId) => api.get(`/resumes/student/${studentId}`)
};

export const profileApi = {
    updateProfile: (data) => api.patch('/users/me', data)
};

export const notificationsApi = {
    list: () => api.get('/notifications'),
    registerToken: (token) => api.post('/notifications/register-token', { token }),
    markAsRead: (id) => api.patch(`/notifications/${id}/read`),
    markAllAsRead: () => api.patch('/notifications/read-all')
};

export const publicApi = {
    getPortfolio: (studentId) => api.get(`/public/portfolio/${studentId}`),
    downloadResume: (studentId) => api.get(`/public/portfolio/${studentId}/resume/download`, { responseType: 'blob' })
};

const rawAiUrl = import.meta.env.VITE_AI_URL || 'http://localhost:8000';
const sanitizedAiUrl = rawAiUrl.endsWith('/') ? rawAiUrl.slice(0, -1) : rawAiUrl;

const aiApiBase = axios.create({
    baseURL: sanitizedAiUrl + '/api/ai'
});

export const aiApi = {
    predictPath: (profile) => aiApiBase.post('/predict-path', { profile }),
    analyzeJobFit: (profile, job) => aiApiBase.post('/analyze-job-fit', { studentProfile: profile, job }),
    auditProject: (project) => aiApiBase.post('/audit-project', { project }),
    interviewChat: (prompt) => aiApiBase.post('/interview-chat', { prompt }),
    interviewAudioChat: (formData) => aiApiBase.post('/interview-audio-chat', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    evaluateInterview: (conversation, jobTitle, jobDescription) => 
        aiApiBase.post('/evaluate-interview', { conversation, jobTitle, jobDescription })
};


export default api;
