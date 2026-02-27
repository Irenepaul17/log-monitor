const mongoose = require('mongoose');

async function audit() {
    const MONGODB_URI = "mongodb+srv://irenepaul17303_db_user:lion123@log-monitor-cluster.ltvoqru.mongodb.net/logmonitor?retryWrites=true&w=majority&appName=log-monitor-cluster";

    console.log('--- PRODUCTION AUDIT ---');
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected.');

        const WorkReport = mongoose.connection.collection('workreports');
        const Complaint = mongoose.connection.collection('complaints');

        const totalReports = await WorkReport.countDocuments();
        const totalComplaints = await Complaint.countDocuments();

        console.log(`Total Work Reports: ${totalReports}`);
        console.log(`Total Complaints: ${totalComplaints}`);

        if (totalReports > 0) {
            const sample = await WorkReport.findOne();
            console.log('Sample Work Report Date Type:', typeof sample.date, sample.date instanceof Date ? '(Date object)' : '(String/Other)');
            console.log('Sample Work Report Date Value:', sample.date);
        }

        if (totalComplaints > 0) {
            const sample = await Complaint.findOne();
            console.log('Sample Complaint Date Type:', typeof sample.date, sample.date instanceof Date ? '(Date object)' : '(String/Other)');
            console.log('Sample Complaint Date Value:', sample.date);
        }

    } catch (err) {
        console.error('Audit failed:', err);
    } finally {
        await mongoose.disconnect();
    }
}

audit();
