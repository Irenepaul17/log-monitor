const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Load .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n');
envLines.forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) process.env[key.trim()] = value.trim();
});

// Since the Models use ESM export default, we might have issues with require.
// I'll just use mongoose.model directly if they are already registered or define dummy ones.
const WorkReportSchema = new mongoose.Schema({ date: String, authorId: String, teamId: String });
const ComplaintSchema = new mongoose.Schema({ date: String, authorId: String, teamId: String, status: String });
const UserSchema = new mongoose.Schema({ phone: String, teamId: String, role: String });

const WorkReport = mongoose.models.WorkReport || mongoose.model('WorkReport', WorkReportSchema);
const Complaint = mongoose.models.Complaint || mongoose.model('Complaint', ComplaintSchema);
const User = mongoose.models.User || mongoose.model('User', UserSchema);

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    console.log('Connected to DB');

    const amit = await User.findOne({ phone: '9000000003' });
    console.log('Amit:', JSON.stringify(amit, null, 2));

    if (amit) {
        const reports = await WorkReport.find({ teamId: amit.teamId }).limit(5);
        console.log('Work Reports for Amit\'s team:', JSON.stringify(reports, null, 2));

        const count = await WorkReport.countDocuments({ teamId: amit.teamId });
        console.log('Total Work Reports for Team:', count);

        const febCount = await WorkReport.countDocuments({
            teamId: amit.teamId,
            date: { $regex: '^2026-02' }
        });
        console.log('Feb 2026 Work Reports for Team (Regex):', febCount);
    }

    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
