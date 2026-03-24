// frontend/src/pages/CreateJob.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { toast } from 'react-hot-toast';
import { Briefcase, MapPin, DollarSign, Code2, AlignLeft, X, Send } from 'lucide-react';

const CreateJob = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        company: '',
        location: '',
        salaryRange: '',
        description: '',
        skillsRequired: '',
        type: 'FULL_TIME'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                requirements: {
                    skillsRequired: formData.skillsRequired.split(',').map(s => s.trim())
                }
            };
            delete payload.skillsRequired;
            await api.post('/jobs', payload);
            toast.success('Job published and visible to institutions!');
            navigate('/recruiter/dashboard');
        } catch (error) {
            toast.error('Failed to post job');
        }
    };

    const inputClass = "w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium";
    const labelClass = "block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2";

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-white italic tracking-tighter">
                    Post a <span className="text-emerald-400">New Job</span>
                </h1>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
                    Fill in the details — students will apply directly
                </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">

                {/* Title + Company */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className={labelClass}>Job Title</label>
                        <div className="relative">
                            <Briefcase size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="text"
                                name="title"
                                placeholder="e.g. Software Engineer"
                                className={`${inputClass} pl-11`}
                                value={formData.title}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>Company</label>
                        <input
                            type="text"
                            name="company"
                            placeholder="e.g. Acme Corp"
                            className={inputClass}
                            value={formData.company}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                {/* Type + Location + Salary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className={labelClass}>Job Type</label>
                        <select
                            name="type"
                            className={inputClass}
                            value={formData.type}
                            onChange={handleChange}
                            required
                        >
                            <option value="FULL_TIME">Full Time</option>
                            <option value="INTERNSHIP">Internship</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Location</label>
                        <div className="relative">
                            <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="text"
                                name="location"
                                placeholder="e.g. Chennai"
                                className={`${inputClass} pl-11`}
                                value={formData.location}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>Salary Range</label>
                        <div className="relative">
                            <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="text"
                                name="salaryRange"
                                placeholder="e.g. 10-15 LPA"
                                className={`${inputClass} pl-11`}
                                value={formData.salaryRange}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                {/* Skills */}
                <div>
                    <label className={labelClass}>Skills Required (comma separated)</label>
                    <div className="relative">
                        <Code2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            name="skillsRequired"
                            placeholder="e.g. React, Node.js, Python"
                            className={`${inputClass} pl-11`}
                            value={formData.skillsRequired}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className={labelClass}>Job Description</label>
                    <div className="relative">
                        <AlignLeft size={16} className="absolute left-4 top-4 text-slate-500" />
                        <textarea
                            name="description"
                            rows={5}
                            placeholder="Describe the role, responsibilities, and expectations..."
                            className={`${inputClass} pl-11 resize-none`}
                            value={formData.description}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={() => navigate('/recruiter/dashboard')}
                        className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-black text-xs uppercase tracking-widest transition-all"
                    >
                        <X size={14} /> Cancel
                    </button>
                    <button
                        type="submit"
                        className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20"
                    >
                        <Send size={14} /> Publish Job
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateJob;
