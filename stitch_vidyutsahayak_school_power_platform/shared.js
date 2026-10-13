/**
 * VidyutSahayak Shared Client Library
 * Handles:
 * - Backend API Communication (with offline/localStorage fallback)
 * - Cross-page Navigation (works in localhost and file:// protocol)
 * - UI Micro-interactions (High Contrast, Vernacular Language, Toasts)
 * - Global Modals (Volunteer Signup, Volunteers Drawer, Impact Map, Hotline)
 */

(function (window) {
  const isHttp = window.location.protocol.startsWith('http');
  const API_BASE = isHttp ? window.location.origin : 'http://localhost:3000';

  // Navigation Helper
  function getPageUrl(target, queryParams) {
    const isLocalFile = window.location.protocol === 'file:';
    let base = '';
    
    if (isLocalFile) {
      const path = window.location.pathname.replace(/\\/g, '/');
      const inSubfolder = path.includes('/stitch_vidyutsahayak_school_power_platform/');
      const prefix = inSubfolder ? '../' : './stitch_vidyutsahayak_school_power_platform/';
      
      switch (target) {
        case 'dashboard':
          base = prefix + 'vidyutsahayak_main_dashboard/code.html';
          break;
        case 'tickets':
        case 'issue-tickets':
          base = prefix + 'issue_tickets_volunteer_dispatch/code.html';
          break;
        case 'report':
        case 'report-failure':
          base = prefix + 'report_electrical_outage/code.html';
          break;
        case 'feed':
        case 'homepage':
          base = prefix + 'vidyutsahayak_homepage_live_dispatch_feed/code.html';
          break;
        default:
          base = prefix + 'vidyutsahayak_main_dashboard/code.html';
      }
    } else {
      switch (target) {
        case 'dashboard':
          base = '/dashboard';
          break;
        case 'tickets':
        case 'issue-tickets':
          base = '/tickets';
          break;
        case 'report':
        case 'report-failure':
          base = '/report';
          break;
        case 'feed':
        case 'homepage':
          base = '/feed';
          break;
        default:
          base = '/dashboard';
      }
    }

    if (queryParams && typeof queryParams === 'object') {
      const qs = new URLSearchParams(queryParams).toString();
      if (qs) base += (base.includes('?') ? '&' : '?') + qs;
    }
    return base;
  }

  function navigateTo(target, queryParams) {
    window.location.href = getPageUrl(target, queryParams);
  }

  // Toast Notification System
  function showToast(title, message, type = 'success') {
    let container = document.getElementById('vs-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'vs-toast-container';
      container.className = 'fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `pointer-events-auto transform transition-all duration-300 translate-y-4 opacity-0 flex items-start gap-3 p-4 rounded-xl shadow-xl max-w-sm text-sm border font-sans ${
      type === 'error'
        ? 'bg-red-900/95 text-white border-red-500'
        : type === 'warning'
        ? 'bg-amber-900/95 text-white border-amber-500'
        : 'bg-slate-900/95 text-white border-slate-700'
    }`;

    const iconMap = {
      success: 'check_circle',
      error: 'error',
      warning: 'warning',
      info: 'info'
    };

    const iconColor = {
      success: 'text-emerald-400',
      error: 'text-red-400',
      warning: 'text-amber-400',
      info: 'text-blue-400'
    }[type] || 'text-amber-400';

    toast.innerHTML = `
      <span class="material-symbols-outlined ${iconColor} text-xl shrink-0 mt-0.5">${iconMap[type] || 'bolt'}</span>
      <div class="flex-1">
        <h4 class="font-bold text-white text-sm">${title}</h4>
        <p class="text-xs text-slate-300 mt-0.5 leading-relaxed">${message || ''}</p>
      </div>
      <button class="text-slate-400 hover:text-white shrink-0 -mr-1 -mt-1 p-1" onclick="this.parentElement.remove()">
        <span class="material-symbols-outlined text-base">close</span>
      </button>
    `;

    container.appendChild(toast);
    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-4', 'opacity-0');
      toast.classList.add('translate-y-0', 'opacity-100');
    });

    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-x-4');
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  }

  // High Contrast Theme Support
  function initHighContrast() {
    const isHighContrast = localStorage.getItem('vs_high_contrast') === 'true';
    if (isHighContrast) {
      document.body.classList.add('vs-high-contrast');
    }

    const contrastBtns = document.querySelectorAll('[title*="Contrast"], button:has(.material-symbols-outlined:contains("contrast"))');
    contrastBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const active = document.body.classList.toggle('vs-high-contrast');
        localStorage.setItem('vs_high_contrast', active);
        showToast(
          active ? 'High Contrast Mode Enabled' : 'Standard Contrast Mode',
          active ? 'Enhanced legibility active for high-glare field environments.' : 'Restored standard institutional civic palette.',
          'info'
        );
      });
    });

    // Inject high contrast CSS rule
    if (!document.getElementById('vs-contrast-style')) {
      const style = document.createElement('style');
      style.id = 'vs-contrast-style';
      style.innerHTML = `
        .vs-high-contrast {
          filter: contrast(1.15) !important;
        }
        .vs-high-contrast body, .vs-high-contrast main, .vs-high-contrast aside {
          background-color: #0b1120 !important;
          color: #f8fafc !important;
        }
        .vs-high-contrast .bg-surface, .vs-high-contrast .bg-surface-container, .vs-high-contrast .bg-surface-container-low, .vs-high-contrast .bg-surface-container-lowest {
          background-color: #111827 !important;
          color: #f9fafb !important;
          border-color: #4b5563 !important;
        }
        .vs-high-contrast .text-on-surface-variant {
          color: #cbd5e1 !important;
        }
      `;
      document.head.appendChild(style);
    }
  }

  // Language Switcher Helper
  function initLanguageSwitcher() {
    const langContainers = document.querySelectorAll('.flex:has(> span:contains("EN"))');
    document.querySelectorAll('body').forEach(b => {
      b.addEventListener('click', e => {
        const target = e.target;
        if (target && (target.innerText === 'HI' || target.innerText === 'MR' || target.innerText === 'EN' || target.innerText === 'हिंदी' || target.innerText === 'मराठी' || target.innerText === 'English')) {
          const lang = target.innerText.trim();
          showToast(`Language Selected: ${lang}`, `Vernacular localization set to ${lang}. Telemetry & SMS prompts mapped.`, 'info');
          const parent = target.closest('div');
          if (parent) {
            parent.querySelectorAll('span').forEach(s => {
              if (s.innerText.includes('|')) return;
              s.classList.remove('text-primary', 'font-bold', 'text-amber-500');
              s.classList.add('text-on-surface-variant');
            });
            target.classList.add('text-primary', 'font-bold');
            target.classList.remove('text-on-surface-variant');
          }
        }
      });
    });
  }

  // Helpline Modal
  function showHelplineModal() {
    let existing = document.getElementById('vs-helpline-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'vs-helpline-modal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm';
    modal.innerHTML = `
      <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div class="flex items-center gap-2 text-primary font-bold">
            <span class="material-symbols-outlined text-amber-600 text-2xl">phone_in_talk</span>
            <h3 class="text-lg font-extrabold text-slate-900">24/7 Rapid Outage Helpline</h3>
          </div>
          <button class="p-1 text-slate-400 hover:text-slate-600" onclick="document.getElementById('vs-helpline-modal').remove()">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <p class="text-sm text-slate-600">
          Direct toll-free connection for rural government school headmasters, teachers, and field electrical responders across Maharashtra.
        </p>
        <div class="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-center gap-3">
          <span class="material-symbols-outlined text-amber-700 text-3xl">emergency</span>
          <div>
            <span class="text-xs uppercase tracking-wider font-bold text-amber-800">Toll-Free National Dispatch</span>
            <div class="text-xl font-extrabold text-slate-900 tracking-tight">1800-843-988 (1800-VIDYUT)</div>
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <a href="tel:1800843988" class="w-full py-3 bg-primary hover:bg-primary-container text-white rounded-xl font-bold text-center flex items-center justify-center gap-2 shadow-md">
            <span class="material-symbols-outlined">call</span> Call Dispatcher Now
          </a>
          <button onclick="navigator.clipboard.writeText('VS OUTAGE HELP 56161'); showToast('SMS Command Copied', 'Paste into your SMS app and send to 56161');" class="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-semibold text-center flex items-center justify-center gap-2 text-sm">
            <span class="material-symbols-outlined text-base">sms</span> Copy Offline SMS Template
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  // Volunteer Modal
  function showVolunteerModal() {
    let existing = document.getElementById('vs-volunteer-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'vs-volunteer-modal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm';
    modal.innerHTML = `
      <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div class="flex items-center gap-2">
            <div class="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <span class="material-symbols-outlined text-2xl">engineering</span>
            </div>
            <div>
              <h3 class="text-lg font-bold text-slate-900 leading-tight">Join Volunteer Technical Pool</h3>
              <span class="text-xs text-slate-500">Certified Wiremen & Solar Engineers for Rural Schools</span>
            </div>
          </div>
          <button class="p-1 text-slate-400 hover:text-slate-600" onclick="document.getElementById('vs-volunteer-modal').remove()">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <form id="volunteerJoinForm" class="flex flex-col gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Full Legal Name *</label>
            <input required type="text" name="name" placeholder="e.g. Anand R. Shinde" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500">
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Mobile (for SMS Dispatches) *</label>
              <input required type="tel" name="phone" placeholder="+91 98..." class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Taluka / Block *</label>
              <select name="taluka" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500">
                <option value="solapur">Solapur (South & North)</option>
                <option value="barshi">Barshi Block</option>
                <option value="madha">Madha Taluka</option>
                <option value="pandharpur">Pandharpur Sub-division</option>
                <option value="karmala">Karmala Area</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Certification / License *</label>
            <select name="role" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500">
              <option value="Licensed Wireman">State Wireman License (Class A / B)</option>
              <option value="Solar PV Systems Engineer">Solar Technician (Suryamitra / NISE)</option>
              <option value="ITI Electrical Apprentice">ITI Electrician / Polytechnic Graduate</option>
              <option value="CSR Volunteer Electrician">Corporate CSR Field Engineer</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">License / Certificate Number</label>
            <input type="text" name="license" placeholder="e.g. LIC-MH-4820 or ITI-2023-SLP" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500">
          </div>
          <div class="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <span class="material-symbols-outlined text-base shrink-0 mt-0.5">verified_user</span>
            <span>You will receive instantaneous SMS notifications when a school within 15 km of your registered taluka logs an emergency outage.</span>
          </div>
          <div class="flex items-center justify-end gap-2 pt-2">
            <button type="button" class="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg" onclick="document.getElementById('vs-volunteer-modal').remove()">Cancel</button>
            <button type="submit" class="px-5 py-2.5 text-sm font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-md flex items-center gap-1.5">
              <span class="material-symbols-outlined text-base">how_to_reg</span> Register as Responder
            </button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('volunteerJoinForm').addEventListener('submit', async e => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const payload = {
        name: fd.get('name'),
        phone: fd.get('phone'),
        taluka: fd.get('taluka'),
        role: fd.get('role'),
        license: fd.get('license') || 'Pending Verification'
      };

      try {
        const res = await fetch(`${API_BASE}/api/technicians`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        modal.remove();
        showToast('Volunteer Registered!', data.message || 'You are now enrolled in the active dispatch pool.', 'success');
      } catch (err) {
        modal.remove();
        showToast('Enrolled Offline', `Registered ${payload.name} for local Solapur cluster dispatch.`, 'success');
      }
    });
  }

  // Volunteers & Techs Drawer / Panel
  function showVolunteersDrawer() {
    let existing = document.getElementById('vs-volunteers-drawer');
    if (existing) existing.remove();

    const drawer = document.createElement('div');
    drawer.id = 'vs-volunteers-drawer';
    drawer.className = 'fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs';
    drawer.innerHTML = `
      <div class="bg-white w-full max-w-md h-full shadow-2xl flex flex-col p-6 overflow-y-auto animate-in slide-in-from-right duration-300">
        <div class="flex items-center justify-between pb-4 border-b border-slate-100">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-amber-600 text-2xl">engineering</span>
            <h3 class="text-lg font-bold text-slate-900">Active Field Responders</h3>
          </div>
          <button class="p-1 text-slate-400 hover:text-slate-600" onclick="document.getElementById('vs-volunteers-drawer').remove()">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="py-3 flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Solapur Cluster Node (28 Standby)</span>
          <button onclick="showVolunteerModal()" class="text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-full border border-amber-200">
            + Register New
          </button>
        </div>
        <div id="volunteersListContainer" class="flex flex-col gap-3 flex-1 mt-2">
          <div class="text-center py-8 text-slate-400 text-sm">Loading field volunteers...</div>
        </div>
      </div>
    `;
    document.body.appendChild(drawer);

    // Fetch technicians
    fetch(`${API_BASE}/api/technicians`)
      .then(res => res.json())
      .then(data => {
        const container = document.getElementById('volunteersListContainer');
        if (!container) return;
        const techs = data.technicians || [];
        if (!techs.length) {
          container.innerHTML = `<div class="text-slate-500 text-sm text-center">No volunteers logged yet.</div>`;
          return;
        }
        container.innerHTML = techs.map(t => `
          <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <img src="${t.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCN1qu01UN-O_-9NrKN-dsLXX7C6Xu4d5m8xSuzEtnrDVQphhZsLGP8BdgO4CsRrcnaFQCSLE81iMJwC_6s199nSX0vciKphvWc8L6Zy1F1osjWTs1n30yPxFIW6lMmsBjDJ1rGSExZ797gAvdW6EcHOMXEkwfEaC8ZzJuMHQngg6BbnP5z7WbMPw9D3lmL-KHDOBGovyPSyZPu3tE_D9jjC_MuZpUG5lX8hRUFT-b4RQMtrswh6Lg'}" class="w-10 h-10 rounded-full object-cover shrink-0">
              <div class="flex flex-col">
                <span class="font-bold text-sm text-slate-900">${t.name}</span>
                <span class="text-xs text-slate-500">${t.role} • ${t.distance || '3 km'}</span>
                <span class="text-[11px] text-amber-800 font-medium">${t.license || ''}</span>
              </div>
            </div>
            <button onclick="pingVolunteer('${t.id}', '${t.name}')" class="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold shrink-0">
              Ping
            </button>
          </div>
        `).join('');
      })
      .catch(() => {
        const container = document.getElementById('volunteersListContainer');
        if (container) container.innerHTML = `<div class="text-slate-500 text-xs">Offline mode active. 28 local volunteers on standby in Solapur.</div>`;
      });
  }

  // Impact Map Modal
  function showImpactMapModal() {
    let existing = document.getElementById('vs-impact-map-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'vs-impact-map-modal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm';
    modal.innerHTML = `
      <div class="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-2xl">map</span>
            <div>
              <h3 class="text-lg font-bold text-slate-900">Solapur District Grid & Feeder Map</h3>
              <span class="text-xs text-slate-500">142 Rural Schools across 6 Talukas</span>
            </div>
          </div>
          <button class="p-1 text-slate-400 hover:text-slate-600" onclick="document.getElementById('vs-impact-map-modal').remove()">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="relative w-full h-72 rounded-xl bg-slate-900 overflow-hidden flex items-center justify-center p-4 border border-slate-800">
          <!-- Stylized Geo Graphic -->
          <svg class="w-full h-full text-slate-700" viewBox="0 0 600 300" fill="none">
            <path d="M50 150 Q 150 50, 300 120 T 550 80" stroke="#334155" stroke-width="2" stroke-dasharray="4 4" />
            <path d="M100 250 Q 250 200, 400 220 T 580 180" stroke="#334155" stroke-width="2" stroke-dasharray="4 4" />
            <!-- Feeder Nodes -->
            <circle cx="120" cy="90" r="12" fill="#ef4444" fill-opacity="0.2" />
            <circle cx="120" cy="90" r="5" fill="#ef4444" />
            <text x="135" y="95" fill="#f87171" font-size="11" font-weight="bold">Wadgaon ZP (#VS-1042 Hazard)</text>

            <circle cx="280" cy="115" r="12" fill="#f59e0b" fill-opacity="0.2" />
            <circle cx="280" cy="115" r="5" fill="#f59e0b" />
            <text x="295" y="120" fill="#fbbf24" font-size="11" font-weight="bold">Pimpalgaon (#VS-1039)</text>

            <circle cx="390" cy="160" r="10" fill="#10b981" fill-opacity="0.2" />
            <circle cx="390" cy="160" r="4" fill="#10b981" />
            <text x="405" y="165" fill="#34d399" font-size="11" font-weight="bold">Adarsh Balak (Restored 2.3h)</text>

            <circle cx="220" cy="210" r="12" fill="#f59e0b" fill-opacity="0.2" />
            <circle cx="220" cy="210" r="5" fill="#f59e0b" />
            <text x="235" y="215" fill="#fbbf24" font-size="11" font-weight="bold">Shindewadi Ashram (#VS-1036)</text>

            <circle cx="480" cy="130" r="8" fill="#10b981" />
            <text x="495" y="135" fill="#94a3b8" font-size="10">Khed 33kV Substation</text>
          </svg>
          <div class="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300 flex items-center gap-3">
            <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-red-500"></span> Hazard Outage</span>
            <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-amber-500"></span> Dispatched</span>
            <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-emerald-500"></span> Restored</span>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-3 text-center">
          <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div class="text-xs text-slate-500 font-semibold">Active Faults</div>
            <div class="text-xl font-bold text-red-600">3 Critical / 7 Major</div>
          </div>
          <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div class="text-xs text-slate-500 font-semibold">Restored This Month</div>
            <div class="text-xl font-bold text-emerald-600">89 Classrooms</div>
          </div>
          <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div class="text-xs text-slate-500 font-semibold">Average Restoration</div>
            <div class="text-xl font-bold text-primary">4.8 Hours</div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  // Diagnostic Log Modal
  function showDiagnosticModal(ticketId) {
    let existing = document.getElementById('vs-diagnostic-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'vs-diagnostic-modal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm';
    modal.innerHTML = `
      <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 animate-in zoom-in-95 duration-200">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-amber-600 text-2xl">electric_meter</span>
            <div>
              <h3 class="text-lg font-bold text-slate-900">Diagnostic Telemetry: ${ticketId || '#VS-1042'}</h3>
              <span class="text-xs text-slate-500">Multimeter Readings & Substation Feeder Line</span>
            </div>
          </div>
          <button class="p-1 text-slate-400 hover:text-slate-600" onclick="document.getElementById('vs-diagnostic-modal').remove()">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="bg-slate-900 rounded-xl p-4 text-emerald-400 font-mono text-xs flex flex-col gap-2">
          <div class="flex justify-between border-b border-slate-800 pb-1">
            <span class="text-slate-400">FEEDER LINE:</span>
            <span class="text-white">SLP-WDG-01 (11kV Overhead)</span>
          </div>
          <div class="flex justify-between border-b border-slate-800 pb-1">
            <span class="text-slate-400">PHASE A (RED):</span>
            <span>42.4A RMS @ 238V (NORMAL)</span>
          </div>
          <div class="flex justify-between border-b border-slate-800 pb-1">
            <span class="text-slate-400">PHASE B (YELLOW):</span>
            <span class="text-red-400 font-bold">0.0A (BLOWN 63A MCB POLE)</span>
          </div>
          <div class="flex justify-between border-b border-slate-800 pb-1">
            <span class="text-slate-400">PHASE C (BLUE):</span>
            <span>38.1A RMS @ 235V (NORMAL)</span>
          </div>
          <div class="flex justify-between border-b border-slate-800 pb-1">
            <span class="text-slate-400">EARTH IMPEDANCE:</span>
            <span>1.84 Ohms (SAFE &lt; 2.0)</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">SOLAR INVERTER:</span>
            <span class="text-amber-400">LOCKED (Under-Voltage Code E04)</span>
          </div>
        </div>
        <p class="text-xs text-slate-600">
          Diagnostic captured with Fluke 376 FC True-RMS Clamp Meter by Lead Technician Rajesh Kumar. Replacement 63A DP MCB Havells en route.
        </p>
        <button onclick="document.getElementById('vs-diagnostic-modal').remove(); showToast('Telemetry Log Exported', 'CSV telemetry dispatch sent to District Electrical Engineer');" class="w-full py-2.5 bg-primary hover:bg-primary-container text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2">
          <span class="material-symbols-outlined text-base">download</span> Export Digital Diagnostic Audit
        </button>
      </div>
    `;
    document.body.appendChild(modal);
  }

  // Ping Volunteer Action
  function pingVolunteer(techId, techName) {
    fetch(`${API_BASE}/api/technicians/${techId}/ping`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        showToast('Ping Dispatched!', data.message || `SMS dispatch triggered for ${techName}.`, 'success');
      })
      .catch(() => {
        showToast('Ping Dispatched!', `SMS simulated to ${techName} (+91-1800-VIDYUT).`, 'success');
      });
  }

  // Wire up Global Navigation Listeners on DOM Load
  document.addEventListener('DOMContentLoaded', () => {
    initHighContrast();
    initLanguageSwitcher();

    // Wire up sidebar links that have data-path
    document.querySelectorAll('[data-path]').forEach(link => {
      const path = link.getAttribute('data-path');
      link.addEventListener('click', e => {
        if (path === 'volunteers-and-techs') {
          e.preventDefault();
          showVolunteersDrawer();
        } else if (path === 'impact-map') {
          e.preventDefault();
          showImpactMapModal();
        } else if (path === 'dashboard' || path === 'issue-tickets' || path === 'report-failure') {
          e.preventDefault();
          navigateTo(path);
        }
      });
    });

    // Wire up helpline buttons
    document.querySelectorAll('.inline-flex:has(> .material-symbols-outlined:contains("phone_in_talk")), .inline-flex:has(> .material-symbols-outlined:contains("support_agent"))').forEach(el => {
      el.style.cursor = 'pointer';
      el.addEventListener('click', e => {
        e.preventDefault();
        showHelplineModal();
      });
    });

    // Wire up Join Volunteer buttons
    const volTrigger = document.getElementById('triggerVolunteerModal');
    if (volTrigger) {
      volTrigger.addEventListener('click', e => {
        e.preventDefault();
        showVolunteerModal();
      });
    }
  });

  // Export globals
  window.VS = {
    API_BASE,
    navigateTo,
    getPageUrl,
    showToast,
    showHelplineModal,
    showVolunteerModal,
    showVolunteersDrawer,
    showImpactMapModal,
    showDiagnosticModal,
    pingVolunteer
  };
})(window);
