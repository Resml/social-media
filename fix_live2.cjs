const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/src/pages/LiveTracker.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const correctForm = `{showForm&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'rgba(15,23,42,0.5)', backdropFilter:'blur(4px)'}}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg" style={{fontFamily:'Outfit,sans-serif',color:'var(--slate-900)'}}>{t('liveTracker.form.createTitle', 'Schedule Live Session')}</h3>
              <button onClick={()=>setShowForm(false)} className="p-2 rounded-xl hover:bg-slate-100"><X size={18}/></button>
            </div>
            <div className="space-y-4">
              <div><label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{color:'var(--slate-400)'}}>{t('liveTracker.form.topic', 'Topic')}</label>
                <input style={inputStyle} placeholder={String(t('liveTracker.form.topicPlaceholder', 'What will you talk about?'))} value={form.topic} onChange={e=>setForm(f=>({...f,topic:e.target.value}))}/></div>
              <div className="grid grid-cols-1 gap-3">
                <div><label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{color:'var(--slate-400)'}}>{t('liveTracker.form.platform', 'Platform')}</label>
                  <select style={{...inputStyle,cursor:'pointer'}} value={form.platform} onChange={e=>setForm(f=>({...f,platform:e.target.value as any}))}>
                    <option value="Facebook">{String(t('dashboard.platforms.facebook', 'Facebook'))}</option>
                    <option value="Instagram">{String(t('dashboard.platforms.instagram', 'Instagram'))}</option>
                    <option value="Both">{String(t('liveTracker.form.both', 'Both'))}</option></select></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{color:'var(--slate-400)'}}>{t('liveTracker.form.dateTime', 'Date & Time')}</label>
                  <input type="datetime-local" style={{...inputStyle,cursor:'pointer'}} value={form.scheduledAt} onChange={e=>setForm(f=>({...f,scheduledAt:e.target.value}))}/></div>
                <div><label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{color:'var(--slate-400)'}}>{t('liveTracker.form.duration', 'Duration (min)')}</label>
                  <input type="number" style={inputStyle} value={form.duration} onChange={e=>setForm(f=>({...f,duration:+e.target.value}))} min={5} max={180}/></div>
              </div>
              <div><label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{color:'var(--slate-400)'}}>{t('liveTracker.form.notes', 'Notes')}</label>
                <input style={inputStyle} placeholder={String(t('liveTracker.form.notesPlaceholder', 'Any notes…'))} value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}/></div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={()=>setShowForm(false)} className="flex-1 py-3 rounded-xl font-bold text-sm border hover:bg-slate-50" style={{borderColor:'var(--slate-200)',color:'var(--slate-600)'}}>{t('liveTracker.form.cancel', 'Cancel')}</button>
              <button onClick={addSession} className="flex-1 py-3 rounded-xl font-bold text-sm text-white hover:opacity-90 active:scale-95" style={{background:'var(--brand-600)'}}>{t('liveTracker.form.submit', 'Schedule Live')}</button>
            </div>
          </div>
        </div>
      )}`;

content = content.replace(
  /\{showForm&&\([\s\S]*?\)\}/,
  correctForm
);

fs.writeFileSync(filePath, content, 'utf8');
