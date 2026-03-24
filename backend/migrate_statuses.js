const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const result = await db.collection('applications').updateMany(
            { status: 'placed' },
            { $set: { status: 'OFFER_ACCEPTED' } }
        );

        console.log(`Successfully migrated ${result.modifiedCount} applications from "placed" to "OFFER_ACCEPTED".`);

        // Also migrate offer_released to OFFERED for consistency
        const result2 = await db.collection('applications').updateMany(
            { status: 'offer_released' },
            { $set: { status: 'OFFERED' } }
        );
        console.log(`Successfully migrated ${result2.modifiedCount} applications from "offer_released" to "OFFERED".`);

        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

migrate();
