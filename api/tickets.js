const fs = require('fs');
const path = require('path');

function readDb() {
  const dbPath = path.join(process.cwd(), 'data', 'db.json');
  if (!fs.existsSync(dbPath)) {
    return { tickets: [], technicians: [], schools: [] };
  }

  try {
    return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  } catch (_error) {
    return { tickets: [], technicians: [], schools: [] };
  }
}

function writeDb(data) {
  const dbPath = path.join(process.cwd(), 'data', 'db.json');
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
}

function getQueryValue(value) {
  if (Array.isArray(value)) return value[0] || '';
  return value || '';
}

module.exports = function handler(req, res) {
  const db = readDb();
  const method = req.method || 'GET';

  if (method === 'GET') {
    const url = req.url || '/';
    const queryString = url.includes('?') ? url.split('?')[1] : '';
    const urgency = getQueryValue((req.query && req.query.urgency) || queryString).toLowerCase();
    let results = [...(db.tickets || [])];

    if (urgency && urgency !== 'all') {
      results = results.filter(t => (t.urgency || '').toLowerCase() === urgency);
    }

    return res.status(200).json({ total: results.length, tickets: results });
  }

  if (method === 'POST') {
    const payload = req.body || {};
    const existingIds = (db.tickets || []).map(t => parseInt((t.id || 'VS-1000').replace('VS-', ''))).filter(n => !isNaN(n));
    const nextNum = (existingIds.length > 0 ? Math.max(...existingIds) : 1042) + 1;
    const newId = `VS-${nextNum}`;

    const newTicket = {
      id: newId,
      schoolName: payload.schoolName || 'Government School',
      udise: payload.udise || '27300000000',
      district: payload.district || 'Solapur',
      taluka: (payload.taluka || 'solapur').toLowerCase(),
      talukaName: payload.talukaName || payload.taluka || 'Solapur South',
      urgency: payload.urgency || 'major',
      urgencyLabel: payload.urgency === 'critical' ? 'CRITICAL HAZARD' : (payload.urgency === 'minor' ? 'LOW / MINOR' : 'HIGH PRIORITY'),
      status: payload.status || 'reported',
      statusLabel: 'Need Volunteer',
      studentsAffected: parseInt(payload.studentsAffected) || 150,
      title: payload.title || payload.issueCategory || 'Electrical Failure Reported',
      description: payload.description || 'Power failure reported by school authority.',
      component: payload.component || payload.issueCategory || 'Main Distribution Wiring',
      distance: payload.distance || '5.0 km',
      reportedAt: 'Just now',
      reportedBy: payload.reportedBy || payload.headmasterName || 'School In-charge',
      reporterPhone: payload.reporterPhone || payload.phone || '+91 98000 00000',
      assignedTech: null,
      diagnostics: payload.diagnostics || {
        feederCode: 'SLP-RUR-99',
        substation: 'Nearest Taluka Substation',
        phaseLoad: 'Phase diagnostic pending',
        transformer: 'Standard Distribution Transformer',
        mcbRating: '415V Main Breaker',
        inverterStatus: 'Diagnostic required'
      },
      photos: payload.photos || [],
      auditTrail: [{
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sender: 'Incident Logged via VidyutSahayak',
        text: `Ticket #${newId} logged by ${payload.reportedBy || 'Staff'}. Alert broadcast initiated.`,
        type: 'system'
      }]
    };

    db.tickets.unshift(newTicket);
    writeDb(db);

    return res.status(201).json({
      success: true,
      message: `Ticket #${newId} dispatched successfully! Local volunteers alerted.`,
      ticket: newTicket
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
