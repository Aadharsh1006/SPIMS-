// frontend/src/pages/tpo/TPOOnboarding.jsx
import { useState, useEffect, useRef } from 'react';
import { tpoApi } from '../../api/api';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { UserPlus, Users, GraduationCap, ArrowRight, Upload } from 'lucide-react';

const TPOOnboarding = () => {
    const [activeTab, setActiveTab] = useState('single');
    const [loading, setLoading] = useState(false);

    const [students, setStudents] = useState([]);
    const [faculties, setFaculties] = useState([]);
    const [selectedFaculty, setSelectedFaculty] = useState('');
    const [selectedStudents, setSelectedStudents] = useState([]);

    const [singleUser, setSingleUser] = useState({
        role: 'STUDENT', email: '', name: '', rollNumber: '', department: '', cgpa: ''
    });

    const [studentsText, setStudentsText] = useState('');
    const [facultiesText, setFacultiesText] = useState('');
    const studentFileRef = useRef();
    const facultyFileRef = useRef();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [sRes, fRes] = await Promise.all([tpoApi.getStudents(), tpoApi.getFaculties()]);
            setStudents(sRes.data.filter(u => u.role === 'STUDENT'));
            setFaculties(fRes.data);
        } catch (err) {
            console.error('Failed to load data', err);
        }
    };

    const handleSingleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (singleUser.role === 'STUDENT') {
                await tpoApi.importStudents([{
                    email: singleUser.email, name: singleUser.name,
                    rollNumber: singleUser.rollNumber, department: singleUser.department, cgpa: singleUser.cgpa
                }]);
                toast.success('Student created successfully');
            } else {
                await tpoApi.importFaculties([{
                    email: singleUser.email, name: singleUser.name, department: singleUser.department
                }]);
                toast.success('Faculty created successfully');
            }
            setSingleUser({ role: 'STUDENT', email: '', name: '', rollNumber: '', department: '', cgpa: '' });
            loadData();
        } catch (err) {
            toast.error('Failed to create user');
        } finally {
            setLoading(false);
        }
    };

    const handleExcelImport = (e, type) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const wb = XLSX.read(evt.target.result, { type: 'binary' });
                const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
                if (data.length === 0) return toast.error('Excel sheet is empty');
                setLoading(true);
                if (type === 'STUDENT') {
                    const res = await tpoApi.importStudents(data);
                    const { addedCount, skippedCount } = res.data;
                    addedCount > 0
                        ? toast.success(`Imported ${addedCount} students.${skippedCount > 0 ? ` (Skipped ${skippedCount})` : ''}`)
                        : toast.error(`No new students added. ${skippedCount} existing skipped.`);
                } else {
                    const res = await tpoApi.importFaculties(data);
                    const { addedCount, skippedCount } = res.data;
                    addedCount > 0
                        ? toast.success(`Imported ${addedCount} faculties.${skippedCount > 0 ? ` (Skipped ${skippedCount})` : ''}`)
                        : toast.error(`No new faculties added. ${skippedCount} existing skipped.`);
                }
                loadData();
            } catch (err) {
                toast.error('Import failed. Check headers: email, name, rollNumber, department, cgpa');
            } finally {
                setLoading(false);
                if (e.target) e.target.value = '';
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleImportText = async (type) => {
        const text = type === 'STUDENT' ? studentsText : facultiesText;
        const list = text.split('\n')
            .map(line => line.trim())
            .filter(line => line.includes(','))
            .map(line => {
                const [email, name] = line.split(',');
                return { email: email.trim(), name: name?.trim() || email.split('@')[0] };
            });
        if (list.length === 0) return toast.error('Format: email,name per line');
        setLoading(true);
        try {
            if (type === 'STUDENT') {
                const res = await tpoApi.importStudents(list);
                toast.success(`Processed: ${res.data.addedCount} added, ${res.data.skippedCount} skipped.`);
                setStudentsText('');
            } else {
                const res = await tpoApi.importFaculties(list);
                toast.success(`Processed: ${res.data.addedCount} added, ${res.data.skippedCount} skipped.`);
                setFacultiesText('');
            }
            loadData();
        } catch (err) {
            toast.error('Import failed');
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async () => {
        if (!selectedFaculty || selectedStudents.length === 0)
            return toast.error('Please select a faculty and at least one student');
        try {
            await tpoApi.assignFaculty({ facultyId: selectedFaculty, studentIds: selectedStudents });
            toast.success('Students assigned to faculty successfully');
            setSelectedStudents([]);
            loadData();
        } catch (err) {
            toast.error('Assignment failed. Please try again.');
        }
    };

    const toggleStudent = (id) => {
        setSelectedStudents(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
    };

    return (
        <div className="space-y-10 pb-20 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">
                    Unified User <span className="text-indigo-400">Onboarding</span>
                </h1>
                <p className="text-slate-400 font-medium mt-1">Register individual users or bulk import via Excel/CSV.</p>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-slate-800 gap-8">
                {[
                    { key: 'single', label: 'Single User Registration' },
                    { key: 'bulk', label: 'Bulk Import (Excel / List)' },
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`pb-3 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${
                            activeTab === tab.key
                                ? 'text-indigo-400 border-indigo-500'
                                : 'text-slate-500 border-transparent hover:text-slate-300'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'single' ? (
                /* Single User Form */
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] max-w-2xl shadow-2xl">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400">
                            <UserPlus size={20} />
                        </div>
                        <h2 className="text-lg font-black text-white uppercase tracking-tight">Register Individual User</h2>
                    </div>

                    <form onSubmit={handleSingleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">User Role</label>
                                <select
                                    className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-white text-sm"
                                    value={singleUser.role}
                                    onChange={e => setSingleUser({ ...singleUser, role: e.target.value })}
                                >
                                    <option value="STUDENT">Student</option>
                                    <option value="FACULTY">Faculty</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Full Name</label>
                                <input
                                    type="text" required placeholder="John Doe"
                                    className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-white text-sm placeholder:text-slate-600"
                                    value={singleUser.name}
                                    onChange={e => setSingleUser({ ...singleUser, name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
                            <input
                                type="email" required placeholder="email@college.edu"
                                className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-white text-sm placeholder:text-slate-600"
                                value={singleUser.email}
                                onChange={e => setSingleUser({ ...singleUser, email: e.target.value })}
                            />
                        </div>

                        {singleUser.role === 'STUDENT' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {[
                                    { label: 'Roll Number', key: 'rollNumber', placeholder: 'CS2021', type: 'text' },
                                    { label: 'Department', key: 'department', placeholder: 'CSE', type: 'text' },
                                    { label: 'CGPA', key: 'cgpa', placeholder: '9.5', type: 'number' },
                                ].map(field => (
                                    <div key={field.key}>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{field.label}</label>
                                        <input
                                            type={field.type} step={field.key === 'cgpa' ? '0.01' : undefined}
                                            placeholder={field.placeholder}
                                            className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-white text-sm placeholder:text-slate-600"
                                            value={singleUser[field.key]}
                                            onChange={e => setSingleUser({ ...singleUser, [field.key]: e.target.value })}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Department</label>
                                <input
                                    type="text" placeholder="Computer Science"
                                    className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-white text-sm placeholder:text-slate-600"
                                    value={singleUser.department}
                                    onChange={e => setSingleUser({ ...singleUser, department: e.target.value })}
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.98] disabled:opacity-50 mt-2"
                        >
                            {loading ? 'Creating...' : `Register ${singleUser.role}`}
                        </button>
                    </form>
                </div>
            ) : (
                /* Bulk Import */
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {[
                        { type: 'STUDENT', label: 'Bulk Students', accent: 'indigo', ref: studentFileRef, text: studentsText, setText: setStudentsText, placeholder: 'email@college.edu, Name\nanother@college.edu, Name', hint: 'email, name, rollNumber, department, cgpa' },
                        { type: 'FACULTY', label: 'Bulk Faculty', accent: 'emerald', ref: facultyFileRef, text: facultiesText, setText: setFacultiesText, placeholder: 'faculty@college.edu, Dr. Smith\nprof@college.edu, Prof. Oak', hint: 'email, name, department' },
                    ].map(({ type, label, accent, ref, text, setText, placeholder, hint }) => (
                        <div key={type} className="bg-slate-900 border border-slate-800 p-7 rounded-[2rem] shadow-2xl">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className={`w-9 h-9 bg-${accent}-500/10 border border-${accent}-500/20 rounded-xl flex items-center justify-center text-${accent}-400`}>
                                        {type === 'STUDENT' ? <GraduationCap size={18} /> : <Users size={18} />}
                                    </div>
                                    <h2 className="text-base font-black text-white uppercase tracking-tight">{label}</h2>
                                </div>
                                <button
                                    onClick={() => ref.current.click()}
                                    className={`flex items-center gap-2 bg-${accent}-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-${accent}-500 transition-all`}
                                >
                                    <Upload size={14} /> Excel
                                </button>
                                <input type="file" ref={ref} hidden accept=".xlsx, .xls" onChange={(e) => handleExcelImport(e, type)} />
                            </div>

                            <textarea
                                className="w-full h-36 p-4 bg-slate-950 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-mono text-slate-300 mb-4 placeholder:text-slate-700 resize-none"
                                placeholder={placeholder}
                                value={text}
                                onChange={e => setText(e.target.value)}
                            />
                            <button
                                onClick={() => handleImportText(type)}
                                className={`w-full py-3 border border-${accent}-500/20 text-${accent}-400 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-${accent}-500/10 transition-all`}
                            >
                                Process Manual List
                            </button>
                            <div className={`mt-4 p-4 bg-${accent}-500/5 rounded-2xl border border-${accent}-500/10`}>
                                <p className={`text-[10px] text-${accent}-400/70 font-bold uppercase tracking-wider mb-1`}>Required Excel Columns:</p>
                                <p className={`text-[10px] text-${accent}-400/50 font-mono`}>{hint}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Assignment Section */}
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] shadow-2xl">
                <div className="mb-8">
                    <h2 className="text-lg font-black text-white uppercase tracking-tight">Mentor Assignment</h2>
                    <p className="text-slate-400 text-sm mt-1">Map students to their respective faculty mentors.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">1. Select Faculty Mentor</label>
                        <select
                            className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 text-white text-sm"
                            value={selectedFaculty}
                            onChange={(e) => setSelectedFaculty(e.target.value)}
                        >
                            <option value="">-- Choose Faculty --</option>
                            {faculties.map(f => (
                                <option key={f._id} value={f._id}>{f.name} ({f.email})</option>
                            ))}
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
                            2. Select Students ({selectedStudents.length} selected)
                        </label>
                        <div className="h-64 overflow-y-auto border border-slate-800 rounded-2xl p-3 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/50">
                            {students.map(s => (
                                <div
                                    key={s._id}
                                    onClick={() => toggleStudent(s._id)}
                                    className={`p-4 rounded-2xl cursor-pointer border-2 transition-all flex items-center gap-3 ${
                                        selectedStudents.includes(s._id)
                                            ? 'bg-slate-800 border-indigo-500 shadow-md'
                                            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                                    }`}
                                >
                                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ${
                                        selectedStudents.includes(s._id) ? 'bg-indigo-600 border-indigo-600' : 'bg-slate-800 border-slate-700'
                                    }`}>
                                        {selectedStudents.includes(s._id) && <span className="text-white text-xs font-black">✓</span>}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-bold text-sm text-white truncate">{s.name}</div>
                                        <div className="text-[10px] font-bold text-indigo-400 tracking-wider uppercase">{s.profile?.rollNumber || 'S-ID'}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-800 flex justify-end">
                    <button
                        onClick={handleAssign}
                        disabled={!selectedFaculty || selectedStudents.length === 0}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.98] disabled:opacity-30 flex items-center gap-3"
                    >
                        Complete Mapping <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TPOOnboarding;
