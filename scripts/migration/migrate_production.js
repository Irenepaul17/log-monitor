/**
 * PRODUCTION MIGRATION SCRIPT
 * 
 * Instructions:
 * 1. Ensure you have your production MONGODB_URI ready.
 * 2. Run this script locally from your terminal:
 *    MONGODB_URI="your_production_connection_string" node migrate_production.js
 * 3. Only after this script says "Migration complete", push your code to GitHub.
 */

const mongoose = require('mongoose');

async function migrate() {
    const MONGODB_URI = process.env.MONGODB_URI;

    if (!MONGODB_URI || MONGODB_URI.includes('localhost') || MONGODB_URI.includes('127.0.0.1')) {
        console.error('❌ ERROR: Please provide a valid production MONGODB_URI.');
        console.error('Usage: MONGODB_URI="mongodb+srv://..." node migrate_production.js');
        process.exit(1);
    }

    console.log('--- PRODUCTION MIGRATION STARTING ---');
    console.log('Connecting to database...');

    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected successfully.');

        // Define minimalistic models (we only care about the 'date' field)
        const WorkReport = mongoose.models.WorkReport || mongoose.model('WorkReport', new mongoose.Schema({ date: mongoose.Schema.Types.Mixed }, { strict: false }));
        const Complaint = mongoose.models.Complaint || mongoose.model('Complaint', new mongoose.Schema({ date: mongoose.Schema.Types.Mixed }, { strict: false }));

        // 1. Migrate Work Reports
        const reports = await WorkReport.find({ date: { $type: 'string' } });
        console.log(`Found ${reports.length} work reports needing migration.`);

        let reportCount = 0;
        for (const report of reports) {
            const dateStr = report.date;
            // Handle YYYY-MM-DD
            if (typeof dateStr === 'string' && dateStr.includes('-')) {
                const [year, month, day] = dateStr.split('-').map(Number);
                const dateObj = new Date(year, month - 1, day, 12, 0, 0);
                await WorkReport.updateOne({ _id: report._id }, { $set: { date: dateObj } });
                reportCount++;
            }
        }
        console.log(`✅ Migrated ${reportCount} work reports.`);

        // 2. Migrate Complaints
        const complaints = await Complaint.find({ date: { $type: 'string' } });
        console.log(`Found ${complaints.length} complaints needing migration.`);

        let complaintCount = 0;
        for (const complaint of complaints) {
            const dateStr = complaint.date;
            if (typeof dateStr === 'string' && dateStr.includes('-')) {
                const [year, month, day] = dateStr.split('-').map(Number);
                const dateObj = new Date(year, month - 1, day, 12, 0, 0);
                await Complaint.updateOne({ _id: complaint._id }, { $set: { date: dateObj } });
                complaintCount++;
            }
        }
        console.log(`✅ Migrated ${complaintCount} complaints.`);

        console.log('\n--- PRODUCTION MIGRATION COMPLETE ---');
        console.log('🚀 You can now safely push your code to GitHub.');

    } catch (err) {
        console.error('❌ MIGRATION FAILED:', err.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

migrate();
