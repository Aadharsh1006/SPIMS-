const mongoose = require('mongoose');

const collegeConfigSchema = mongoose.Schema({
    collegeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'College',
        required: true,
        unique: true
    },
    themeColor: {
        type: String,
        default: '#4f46e5' // Indigo-600
    },
    logoUrl: {
        type: String,
        default: ''
    },
    portalTitle: {
        type: String,
        default: 'Placement Portal'
    },
    contactEmail: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('CollegeConfig', collegeConfigSchema);
