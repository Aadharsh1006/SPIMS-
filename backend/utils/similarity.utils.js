// backend/utils/similarity.utils.js
const cosineSimilarity = (a, b) => {
    if (!a.length || !b.length) return 0;
    const len = Math.min(a.length, b.length);
    let dot = 0, magA = 0, magB = 0;
    for (let i = 0; i < len; i++) {
        dot += a[i] * b[i];
        magA += a[i] * a[i];
        magB += b[i] * b[i];
    }
    if (!magA || !magB) return 0;
    return dot / (Math.sqrt(magA) * Math.sqrt(magB));
};

module.exports = { cosineSimilarity };
