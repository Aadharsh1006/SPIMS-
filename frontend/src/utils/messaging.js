// frontend/src/utils/messaging.js

/**
 * Maps a pair of user roles to the corresponding Message model conversationType enum.
 * @param {string} role1 - Role of participant 1
 * @param {string} role2 - Role of participant 2
 * @returns {string} - The conversationType enum value
 */
export const getConversationType = (role1, role2) => {
    const pair = [role1, role2].sort();

    // TPO pairs
    if (pair.includes('TPO')) {
        if (pair.includes('STUDENT')) return 'TPO_STUDENT';
        if (pair.includes('FACULTY')) return 'FACULTY_TPO';
        if (pair.includes('RECRUITER')) return 'RECRUITER_TPO';
        if (pair.includes('ALUMNI')) return 'ALUMNI_TPO';
    }

    // Student pairs
    if (pair.includes('STUDENT')) {
        if (pair.includes('FACULTY')) return 'FACULTY_STUDENT';
        if (pair.includes('RECRUITER')) return 'RECRUITER_STUDENT';
        if (pair.includes('ALUMNI')) return 'ALUMNI_STUDENT';
    }

    // Special pairs
    if (pair.includes('FACULTY')) {
        if (pair.includes('RECRUITER')) return 'RECRUITER_FACULTY';
        if (pair.includes('ALUMNI')) return 'FACULTY_ALUMNI';
    }
    if (pair[0] === 'ALUMNI' && pair[1] === 'ALUMNI') return 'ALUMNI_MENTORSHIP';
    
    // SuperAdmin pairs
    if (pair.includes('SUPER_ADMIN')) {
        if (pair.includes('TPO')) return 'SUPER_ADMIN_TPO';
        if (pair.includes('RECRUITER')) return 'SUPER_ADMIN_RECRUITER';
        if (pair.includes('ALUMNI')) return 'SUPER_ADMIN_ALUMNI';
    }

    return 'TPO_STUDENT'; // Default fallback
};
