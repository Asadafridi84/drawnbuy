import os

css = """
.pw{max-width:1100px;margin:0 auto;display:grid;grid-template-columns:280px 1fr;gap:1.5rem}
.ps{display:flex;flex-direction:column;gap:1rem}
.pc{background:#fff;border-radius:16px;padding:1.5rem;box-shadow:0 2px 12px rgba(124,58,237,.08)}
.av{width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#5b21b6);color:#fff;font-size:1.5rem;font-weight:800;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;border:3px solid #ede9fe}
.pn{font-size:1.1rem;font-weight:800;color:#1a0a3e;text-align:center}
.pe{font-size:.78rem;color:#6b7280;text-align:center;margin-bottom:.25rem}
.pm{font-size:.72rem;color:#9ca3af;text-align:center;margin-bottom:1rem}
.sr{display:flex;align-items:center;gap:.6rem;padding:.5rem .6rem;border-radius:8px;background:#f4f0ff;margin-bottom:.4rem}
.si{color:#7c3aed;display:flex;align-items:center}
.sl{font-size:.78rem;color:#6b7280;flex:1}
.sv{font-size:.88rem;font-weight:800;color:#1a0a3e}
.tb{display:flex;align-items:center;gap:.6rem;width:100%;padding:.65rem .9rem;border-radius:10px;border:none;background:transparent;color:#6b7280;font-family:inherit;font-size:.88rem;font-weight:600;cursor:pointer;transition:.15s;text-align:left}
.tb:hover{background:#f4f0ff;color:#7c3aed}
.tb.on{background:linear-gradient(90deg,#7c3aed,#5b21b6);color:#fff}
.st{font-size:1rem;font-weight:800;color:#1a0a3e;margin-bottom:.25rem}
.ss{font-size:.8rem;color:#6b7280;margin-bottom:1.25rem}
.fl{font-size:.8rem;font-weight:700;color:#374151;margin-bottom:.4rem;display:block}
.fi{width:100%;border:1.5px solid #e5e7eb;border-radius:10px;padding:.65rem .9rem;font-family:inherit;font-size:.88rem;color:#1a0a3e;outline:none;transition:.15s;box-sizing:border-box}
.fi:focus{border-color:#7c3aed;box-shadow:0 0 0 3px rgba(124,58,237,.12)}
.fi:disabled{background:#f9fafb;color:#9ca3af}
.bp{background:linear-gradient(90deg,#7c3aed,#5b21b6);color:#fff;border:none;border-radius:10px;padding:.65rem 1.4rem;font-family:inherit;font-size:.88rem;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:.4rem;transition:.15s}
.bp:hover{opacity:.9}
.bd{background:#fee2e2;color:#b91c1c;border:1.5px solid #fca5a5;border-radius:10px;padding:.55rem 1.1rem;font-family:inherit;font-size:.82rem;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:.4rem;transition:.15s}
.bd:hover{background:#fca5a5}
.bg2{background:#f4f0ff;color:#7c3aed;border:1.5px solid #ede9fe;border-radius:10px;padding:.55rem 1.1rem;font-family:inherit;font-size:.82rem;font-weight:700;cursor:pointer;transition:.15s;display:inline-flex;align-items:center;gap:.4rem}
.bg2:hover{background:#ede9fe}
.dv{border:none;border-top:1px solid #f3f4f6;margin:1.25rem 0}
.fc{display:flex;align-items:center;gap:.9rem;padding:.85rem;border-radius:12px;border:1.5px solid #f3f4f6;background:#fafafa;margin-bottom:.6rem;transition:.15s}
.fc:hover{border-color:#ede9fe;background:#f4f0ff}
.fa{width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#5b21b6);color:#fff;font-size:.88rem;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.fn{font-size:.9rem;font-weight:700;color:#1a0a3e}
.fe{font-size:.75rem;color:#9ca3af}
.ftag{font-size:.68rem;font-weight:700;padding:2px 8px;border-radius:20px}
.tfam{background:#dbeafe;color:#1d4ed8}
.tfri{background:#d1fae5;color:#065f46}
.tinv{background:#fef3c7;color:#92400e}
.sd{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.son{background:#22c55e}.sof{background:#d1d5db}.sin{background:#fbbf24}
.nr{display:flex;align-items:center;justify-content:space-between;padding:.85rem 0;border-bottom:1px solid #f3f4f6}
.nl{font-size:.88rem;font-weight:600;color:#1a0a3e}
.ns{font-size:.75rem;color:#9ca3af}
.tog{position:relative;width:44px;height:24px;cursor:pointer;display:inline-block}
.tog input{opacity:0;width:0;height:0}
.tsl{position:absolute;inset:0;border-radius:24px;background:#e5e7eb;transition:.2s}
.tog input:checked + .tsl{background:#7c3aed}
.tsl::before{content:"";position:absolute;width:18px;height:18px;left:3px;top:3px;border-radius:50%;background:#fff;transition:.2s;box-shadow:0 1px 4px rgba(0,0,0,.2)}
.tog input:checked + .tsl::before{transform:translateX(20px)}
.ok{background:#d1fae5;color:#065f46;border-radius:8px;padding:.5rem .9rem;font-size:.82rem;font-weight:700;display:inline-flex;align-items:center;gap:.4rem}
@media(max-width:768px){.pw{grid-template-columns:1fr}}
"""

# Read existing file parts (icons + TABS + FRIENDS + export default)
existing = open('src/pages/ProfilePage.jsx', encoding='utf-8').read()

# Find where TABS starts (after icon definitions)
tabs_idx = existing.find('const TABS')
export_idx = existing.find('export default function')

# Get icons part (before TABS)
icons_part = existing[:tabs_idx]

# Get TABS + FRIENDS + export default (from TABS onwards)
rest_part = existing[tabs_idx:]

# Rebuild file with proper CSS
new_content = icons_part + 'const TABS = [\n  { id: "profile",  label: "Profile",          icon: IH },\n  { id: "friends",  label: "Friends & Family",  icon: IU },\n  { id: "wishlist", label: "Wishlist",           icon: IW },\n  { id: "notifs",   label: "Notifications",      icon: IB },\n  { id: "security", label: "Security",           icon: IL },\n  { id: "data",     label: "Your Data",          icon: ID },\n];\nconst FRIENDS = [\n  { id:1, name:"Anna Lindqvist", email:"anna@example.com", av:"AL", rel:"Family",  status:"online",  cv:12 },\n  { id:2, name:"Maja Eriksson",  email:"maja@example.com", av:"ME", rel:"Friend",  status:"offline", cv:7  },\n  { id:3, name:"Erik Johansson", email:"erik@example.com", av:"EJ", rel:"Family",  status:"online",  cv:4  },\n  { id:4, name:"Sofia Berg",     email:"sofia@example.com",av:"SB", rel:"Friend",  status:"offline", cv:19 },\n];\nconst CSS = `' + css + '`;\n'

# Add the export default function part
export_part = existing[export_idx:]
new_content += export_part

open('src/pages/ProfilePage.jsx', 'w', encoding='utf-8').write(new_content)
print('Done! Lines:', len(new_content.splitlines()))
