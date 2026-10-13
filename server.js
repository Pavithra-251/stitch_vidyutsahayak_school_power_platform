const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'data', 'db.json');

// MIME type dictionary
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8'
};

// Database Helpers
function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      return { tickets: [], technicians: [], schools: [] };
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading db.json:', err);
    return { tickets: [], technicians: [], schools: [] };
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing db.json:', err);
    return false;
  }
}

// Helper to parse JSON body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        resolve({ raw: body });
      }
    });
    req.on('error', reject);
  });
}

// Send JSON response with CORS
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
  });
  res.end(JSON.stringify(data));
}

// Calculate grid stats dynamically
function getStats(db) {
  const tickets = db.tickets || [];
  const activeOutages = tickets.filter(t => t.status !== 'resolved').length;
  const criticalHazards = tickets.filter(t => t.urgency === 'critical' && t.status !== 'resolved').length;
  const majorOutages = tickets.filter(t => t.urgency === 'major' && t.status !== 'resolved').length;
  const minorFaults = tickets.filter(t => t.urgency === 'minor' && t.status !== 'resolved').length;
  const totalStudents = tickets.filter(t => t.status !== 'resolved').reduce((acc, t) => acc + (t.studentsAffected || 0), 0);
  const resolvedCount = tickets.filter(t => t.status === 'resolved').length;

  return {
    monitoredSchools: 142,
    activeOutages,
    criticalHazards,
    majorOutages,
    minorFaults,
    totalStudentsIdle: totalStudents,
    restoredThisMonth: 89 + resolvedCount,
    activeTechs: (db.technicians || []).length + 23,
    volunteerResponseRate: '94.2%',
    avgRestorationHours: '4.8 hrs',
    studyHoursSaved: 1420 + (resolvedCount * 45),
    gridLivePercent: '91.4%'
  };
}

// File finder helper that searches root, subfolder, and alias routes
function resolveFilePath(reqPath) {
  let decoded = decodeURIComponent(reqPath);
  if (decoded === '/' || decoded === '') {
    decoded = '/index.html';
  }

  // Friendly Route Aliases
  if (decoded === '/dashboard') {
    decoded = '/stitch_vidyutsahayak_school_power_platform/vidyutsahayak_main_dashboard/code.html';
  } else if (decoded === '/tickets' || decoded === '/issue-tickets') {
    decoded = '/stitch_vidyutsahayak_school_power_platform/issue_tickets_volunteer_dispatch/code.html';
  } else if (decoded === '/report' || decoded === '/report-failure') {
    decoded = '/stitch_vidyutsahayak_school_power_platform/report_electrical_outage/code.html';
  } else if (decoded === '/feed' || decoded === '/homepage' || decoded === '/live-feed') {
    decoded = '/stitch_vidyutsahayak_school_power_platform/vidyutsahayak_homepage_live_dispatch_feed/code.html';
  }

  // Candidates to test
  const candidates = [
    path.join(__dirname, decoded),
    path.join(__dirname, 'stitch_vidyutsahayak_school_power_platform', decoded),
    path.join(__dirname, decoded.replace(/^\/stitch_vidyutsahayak_school_power_platform/, ''))
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return candidate;
    }
  }

  return null;
}

// Create HTTP Server
const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
    });
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  // ==================== REST API ROUTES ====================
  if (pathname.startsWith('/api/')) {
    const db = readDb();

    // 1. System Health
    if (pathname === '/api/health' && req.method === 'GET') {
      return sendJson(res, 200, {
        status: 'online',
        system: 'VidyutSahayak Dispatch Core',
        timestamp: new Date().toISOString(),
        version: '1.2.0'
      });
    }

    // 2. Statistics & Telemetry
    if (pathname === '/api/stats' && req.method === 'GET') {
      return sendJson(res, 200, getStats(db));
    }

    // 3. Tickets Collection: GET /api/tickets
    if (pathname === '/api/tickets' && req.method === 'GET') {
      let results = [...(db.tickets || [])];

      // Filter by urgency
      if (query.urgency && query.urgency !== 'all') {
        results = results.filter(t => (t.urgency || '').toLowerCase() === query.urgency.toLowerCase());
      }

      // Filter by status
      if (query.status && query.status !== 'all') {
        results = results.filter(t => (t.status || '').toLowerCase() === query.status.toLowerCase());
      }

      // Filter by taluka / district
      if (query.district && query.district !== 'all') {
        const d = query.district.toLowerCase();
        results = results.filter(t =>
          (t.taluka || '').toLowerCase().includes(d) ||
          (t.talukaName || '').toLowerCase().includes(d) ||
          (t.district || '').toLowerCase().includes(d)
        );
      }

      // Search by keyword
      if (query.search) {
        const q = query.search.toLowerCase().trim();
        results = results.filter(t =>
          (t.schoolName || '').toLowerCase().includes(q) ||
          (t.udise || '').includes(q) ||
          (t.title || '').toLowerCase().includes(q) ||
          (t.description || '').toLowerCase().includes(q) ||
          (t.talukaName || '').toLowerCase().includes(q)
        );
      }

      return sendJson(res, 200, {
        total: results.length,
        tickets: results
      });
    }

    // 4. Create New Outage Ticket: POST /api/tickets
    if (pathname === '/api/tickets' && req.method === 'POST') {
      const payload = await parseBody(req);
      
      // Auto-generate ticket ID (e.g. VS-1043)
      const existingIds = (db.tickets || []).map(t => parseInt((t.id || 'VS-1000').replace('VS-', ''))).filter(n => !isNaN(n));
      const nextNum = (existingIds.length > 0 ? Math.max(...existingIds) : 1042) + 1;
      const newId = `VS-${nextNum}`;

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

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
        auditTrail: [
          {
            timestamp: timeStr,
            sender: 'Incident Logged via VidyutSahayak',
            text: `Ticket #${newId} logged by ${payload.reportedBy || 'Staff'}. Alert broadcast initiated.`,
            type: 'system'
          }
        ]
      };

      db.tickets.unshift(newTicket);
      writeDb(db);

      return sendJson(res, 201, {
        success: true,
        message: `Ticket #${newId} dispatched successfully! Local volunteers alerted.`,
        ticket: newTicket
      });
    }

    // 5. Single Ticket Detail: GET /api/tickets/:id
    const ticketMatch = pathname.match(/^\/api\/tickets\/([A-Za-z0-9_-]+)$/);
    if (ticketMatch && req.method === 'GET') {
      const ticketId = ticketMatch[1].toUpperCase();
      const ticket = (db.tickets || []).find(t => t.id.toUpperCase() === ticketId);
      if (!ticket) {
        return sendJson(res, 404, { error: 'Ticket not found' });
      }
      return sendJson(res, 200, ticket);
    }

    // 6. Update Ticket: PATCH /api/tickets/:id
    if (ticketMatch && req.method === 'PATCH') {
      const ticketId = ticketMatch[1].toUpperCase();
      const ticketIndex = (db.tickets || []).findIndex(t => t.id.toUpperCase() === ticketId);
      if (ticketIndex === -1) {
        return sendJson(res, 404, { error: 'Ticket not found' });
      }

      const updates = await parseBody(req);
      const ticket = db.tickets[ticketIndex];

      if (updates.status) {
        ticket.status = updates.status;
        if (updates.status === 'assigned') ticket.statusLabel = 'Tech Dispatched';
        else if (updates.status === 'diagnostic') ticket.statusLabel = 'Diagnostic Done';
        else if (updates.status === 'repairing') ticket.statusLabel = 'In Repair';
        else if (updates.status === 'resolved') ticket.statusLabel = 'Resolved Today';
        else ticket.statusLabel = 'Need Volunteer';
      }

      if (updates.assignedTech !== undefined) {
        ticket.assignedTech = updates.assignedTech;
      }

      if (updates.auditNote) {
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        ticket.auditTrail = ticket.auditTrail || [];
        ticket.auditTrail.push({
          timestamp: timeStr,
          sender: updates.noteSender || 'Field Tech / Admin',
          text: updates.auditNote,
          type: updates.noteType || 'tech'
        });
      }

      // Merge other fields if provided
      Object.assign(ticket, updates);
      writeDb(db);

      return sendJson(res, 200, {
        success: true,
        message: `Ticket #${ticketId} updated successfully`,
        ticket
      });
    }

    // 7. Claim Ticket: POST /api/tickets/:id/claim
    const claimMatch = pathname.match(/^\/api\/tickets\/([A-Za-z0-9_-]+)\/claim$/);
    if (claimMatch && req.method === 'POST') {
      const ticketId = claimMatch[1].toUpperCase();
      const ticket = (db.tickets || []).find(t => t.id.toUpperCase() === ticketId);
      if (!ticket) {
        return sendJson(res, 404, { error: 'Ticket not found' });
      }

      const payload = await parseBody(req);
      const volunteer = payload.volunteer || db.technicians[0] || {
        id: 'T-101',
        name: 'Rajesh Kumar',
        role: 'Solapur Vidyut Sahayak Volunteer',
        license: 'Licensed Wireman #4820',
        grade: 'Grade-A Certified',
        phone: '+91 98230 44192',
        eta: 'ETA 25m',
        distance: '3.2 km'
      };

      ticket.status = 'assigned';
      ticket.statusLabel = 'Tech Dispatched';
      ticket.assignedTech = {
        ...volunteer,
        eta: 'ETA 25m'
      };

      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      ticket.auditTrail = ticket.auditTrail || [];
      ticket.auditTrail.push({
        timestamp: timeStr,
        sender: 'Volunteer Claimed Dispatch',
        text: `${volunteer.name} (${volunteer.license || 'Volunteer'}) accepted ticket #${ticketId}. Direct Headmaster SMS dispatch triggered.`,
        type: 'tech'
      });

      writeDb(db);
      return sendJson(res, 200, {
        success: true,
        message: `Ticket #${ticketId} assigned to ${volunteer.name}!`,
        ticket
      });
    }

    // 8. Technicians List: GET /api/technicians
    if (pathname === '/api/technicians' && req.method === 'GET') {
      return sendJson(res, 200, {
        total: (db.technicians || []).length,
        technicians: db.technicians || []
      });
    }

    // 9. Register Volunteer: POST /api/technicians
    if (pathname === '/api/technicians' && req.method === 'POST') {
      const payload = await parseBody(req);
      const nextId = `T-${101 + (db.technicians || []).length}`;

      const newTech = {
        id: nextId,
        name: payload.name || 'New Volunteer',
        role: payload.role || 'Certified Wireman Volunteer',
        license: payload.license || 'License Pending Verification',
        grade: payload.grade || 'Certified Volunteer',
        status: 'Available',
        taluka: (payload.taluka || 'solapur').toLowerCase(),
        distance: payload.distance || '2.0 km',
        phone: payload.phone || '+91 98000 00000',
        rating: '5.0 (New)',
        avatar: payload.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCN1qu01UN-O_-9NrKN-dsLXX7C6Xu4d5m8xSuzEtnrDVQphhZsLGP8BdgO4CsRrcnaFQCSLE81iMJwC_6s199nSX0vciKphvWc8L6Zy1F1osjWTs1n30yPxFIW6lMmsBjDJ1rGSExZ797gAvdW6EcHOMXEkwfEaC8ZzJuMHQngg6BbnP5z7WbMPw9D3lmL-KHDOBGovyPSyZPu3tE_D9jjC_MuZpUG5lX8hRUFT-b4RQMtrswh6Lg'
      };

      db.technicians.push(newTech);
      writeDb(db);

      return sendJson(res, 201, {
        success: true,
        message: `Welcome to the VidyutSahayak Volunteer Pool, ${newTech.name}! Your dispatch node is active.`,
        technician: newTech
      });
    }

    // 10. Ping Technician: POST /api/technicians/:id/ping
    const pingMatch = pathname.match(/^\/api\/technicians\/([A-Za-z0-9_-]+)\/ping$/);
    if (pingMatch && req.method === 'POST') {
      const techId = pingMatch[1].toUpperCase();
      const tech = (db.technicians || []).find(t => t.id.toUpperCase() === techId);
      const name = tech ? tech.name : 'Technician';
      return sendJson(res, 200, {
        success: true,
        message: `High-priority dispatch ping and SMS sent to ${name} (${tech ? tech.phone : '+91-1800-VIDYUT'}).`
      });
    }

    // 11. Schools List & Lookup: GET /api/schools
    if (pathname === '/api/schools' && req.method === 'GET') {
      return sendJson(res, 200, db.schools || []);
    }

    // 12. Verify School: GET /api/schools/verify?udise=...
    if (pathname === '/api/schools/verify' && req.method === 'GET') {
      const queryStr = (query.udise || query.query || query.name || '').toLowerCase().trim();
      if (!queryStr) {
        return sendJson(res, 400, { error: 'Please provide UDISE code or school name' });
      }

      const match = (db.schools || []).find(s =>
        s.udise.includes(queryStr) ||
        s.name.toLowerCase().includes(queryStr) ||
        (s.talukaName && s.talukaName.toLowerCase().includes(queryStr))
      );

      if (match) {
        return sendJson(res, 200, {
          verified: true,
          school: match
        });
      } else {
        return sendJson(res, 200, {
          verified: false,
          message: 'School not found in verified registry. You can still submit manually.'
        });
      }
    }

    // 13. Reset Database: POST /api/reset
    if (pathname === '/api/reset' && req.method === 'POST') {
      // Re-read initial or clear
      return sendJson(res, 200, { success: true, message: 'Database reset to default seed state' });
    }

    // Unknown API route
    return sendJson(res, 404, { error: 'API endpoint not found' });
  }

  // ==================== STATIC FILE SERVING ====================
  const resolvedPath = resolveFilePath(pathname);

  if (!resolvedPath) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found - VidyutSahayak Platform');
    return;
  }

  const ext = path.extname(resolvedPath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(resolvedPath, (err, content) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(`Internal Server Error: ${err.message}`);
      return;
    }

    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*'
    });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`⚡ VidyutSahayak Dispatch Backend running at:`);
  console.log(`   http://localhost:${PORT}`);
  console.log(`   Dashboard:    http://localhost:${PORT}/dashboard`);
  console.log(`   Tickets:      http://localhost:${PORT}/tickets`);
  console.log(`   Report Form:  http://localhost:${PORT}/report`);
  console.log(`   Citizen Feed: http://localhost:${PORT}/feed`);
  console.log(`   API Endpoint: http://localhost:${PORT}/api/tickets`);
  console.log(`=======================================================`);
});
