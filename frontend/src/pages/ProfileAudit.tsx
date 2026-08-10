import React, { useState } from 'react';
import {
  ClipboardList, CheckSquare, Square, RefreshCw,
  ChevronDown, ChevronUp, User, BarChart2, FileText,
  MessageSquare, TrendingUp, ShieldAlert
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';
import { ProfileAuditReport } from '../components/ProfileAuditReport';
import { useRef } from 'react';
import { Download } from 'lucide-react';

interface CheckItem { id: string; label: string; tip?: string; selfDone: boolean; compDone: boolean; }
interface Section  { id: string; title: string; Icon: React.FC<any>; items: CheckItem[]; open: boolean; }

// Sections will be initialized inside component

const COMPETITORS = ['Competitor 1', 'Competitor 2'];

const inputStyle: React.CSSProperties = {
  width:'100%', padding:'0.5rem 0.75rem', borderRadius:'0.6rem',
  border:'1px solid var(--slate-200)', background:'var(--slate-50)',
  fontSize:'0.8rem', color:'var(--slate-900)', outline:'none',
};

const scoreColor = (pct: number) =>
  pct >= 80 ? 'var(--brand-700)' : pct >= 50 ? 'var(--brand-500)' : 'var(--slate-400)';

const scoreBg = (pct: number) =>
  pct >= 80 ? 'var(--brand-50)' : pct >= 50 ? 'var(--brand-50)' : 'var(--slate-100)';

export const ProfileAudit = () => {
  const { t } = useTranslation();
  
  const [sections, setSections] = useState<Section[]>(() => [
    {
      id: 'profile', title: String(t('profileAudit.sections.profile.title', 'Profile Completeness')), Icon: User, open: true,
      items: [
        { id:'p1', label:String(t('profileAudit.sections.profile.p1', 'Profile info fully filled (bio, location, contact)')), tip:'स्वत: बद्दल सर्व माहिती भरा', selfDone:false, compDone:false },
        { id:'p2', label:String(t('profileAudit.sections.profile.p2', 'Profile photo & cover image — professional quality')),  selfDone:false, compDone:false },
        { id:'p3', label:String(t('profileAudit.sections.profile.p3', 'Check-ins enabled & used')),                            selfDone:false, compDone:false },
        { id:'p4', label:String(t('profileAudit.sections.profile.p4', 'Recommendations present on page')),                     selfDone:false, compDone:false },
        { id:'p5', label:String(t('profileAudit.sections.profile.p5', 'Interests & likes filled completely')),                 selfDone:false, compDone:false },
      ]
    },
    {
      id: 'reach', title: String(t('profileAudit.sections.reach.title', 'Reach & Followers')), Icon: TrendingUp, open: true,
      items: [
        { id:'r1', label:String(t('profileAudit.sections.reach.r1', 'Follower count (note & compare)')),           selfDone:false, compDone:false },
        { id:'r2', label:String(t('profileAudit.sections.reach.r2', 'Page likes count')),                          selfDone:false, compDone:false },
        { id:'r3', label:String(t('profileAudit.sections.reach.r3', 'Constituency / Ward connections count')), tip:'मतदारसंघातील लोकं किती जोडले आहेत', selfDone:false, compDone:false },
      ]
    },
    {
      id: 'content', title: String(t('profileAudit.sections.content.title', 'Content Audit (Last 2 Months)')), Icon: FileText, open: true,
      items: [
        { id:'c1', label:String(t('profileAudit.sections.content.c1', 'Number of Events posted')),             selfDone:false, compDone:false },
        { id:'c2', label:String(t('profileAudit.sections.content.c2', 'Number of Paid Ads run')),              selfDone:false, compDone:false },
        { id:'c3', label:String(t('profileAudit.sections.content.c3', 'Number of Images posted')),             selfDone:false, compDone:false },
        { id:'c4', label:String(t('profileAudit.sections.content.c4', 'Number of Articles / Long-form posts')),selfDone:false, compDone:false },
        { id:'c5', label:String(t('profileAudit.sections.content.c5', 'Number of Videos posted')),             selfDone:false, compDone:false },
        { id:'c6', label:String(t('profileAudit.sections.content.c6', 'Number of Live Videos')),               selfDone:false, compDone:false },
        { id:'c7', label:String(t('profileAudit.sections.content.c7', 'Are images readable & high quality?')), selfDone:false, compDone:false },
        { id:'c8', label:String(t('profileAudit.sections.content.c8', 'Facebook Group created?')), tip:'किमान 30 मेंबर असावेत', selfDone:false, compDone:false },
        { id:'c9', label:String(t('profileAudit.sections.content.c9', 'Posting consistency — daily or regular?')), selfDone:false, compDone:false },
        { id:'c10',label:String(t('profileAudit.sections.content.c10', "Others' good posts shared?")),          selfDone:false, compDone:false },
      ]
    },
    {
      id: 'engagement', title: String(t('profileAudit.sections.engagement.title', 'Engagement Analysis')), Icon: MessageSquare, open: false,
      items: [
        { id:'e1', label:String(t('profileAudit.sections.engagement.e1', 'Topics posted & response rate per topic')),          selfDone:false, compDone:false },
        { id:'e2', label:String(t('profileAudit.sections.engagement.e2', 'Likes, Comments, Shares breakdown by topic')),       selfDone:false, compDone:false },
        { id:'e3', label:String(t('profileAudit.sections.engagement.e3', 'Content quality assessment')),                       selfDone:false, compDone:false },
        { id:'e4', label:String(t('profileAudit.sections.engagement.e4', 'Which age group responds most?')),    tip:'कोणत्या वयोगटातील लोकं जास्त प्रतिसाद देतात', selfDone:false, compDone:false },
        { id:'e5', label:String(t('profileAudit.sections.engagement.e5', 'Which area / location responds most?')), tip:'कोणत्या भागातील लोकं जास्त प्रतिसाद देतात', selfDone:false, compDone:false },
        { id:'e6', label:String(t('profileAudit.sections.engagement.e6', "Women's response percentage")),       tip:'महिलांचे प्रमाण किती', selfDone:false, compDone:false },
        { id:'e7', label:String(t('profileAudit.sections.engagement.e7', 'Response to issue-based vs development posts')),     selfDone:false, compDone:false },
        { id:'e8', label:String(t('profileAudit.sections.engagement.e8', 'Development work posts — engagement rate')),         selfDone:false, compDone:false },
      ]
    },
  ]);
  const [competitor, setCompetitor] = useState(COMPETITORS[0]);
  const [notes, setNotes]           = useState<Record<string, string>>({});
  const [activeTab, setActiveTab]   = useState<'self' | 'compare'>('self');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const generatePDF = async () => {
    if (!reportRef.current) return;
    setIsGeneratingReport(true);
    
    try {
      const element = reportRef.current;
      
      const imgData = await htmlToImage.toPng(element, { 
        pixelRatio: 2, 
        backgroundColor: '#ffffff',
        style: { opacity: '1' }
      });
      
      if (!imgData || imgData === 'data:,') {
        toast.error("Failed to capture report. Image is empty.");
        return;
      }
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (element.offsetHeight * pdfWidth) / element.offsetWidth;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Profile_Audit_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success("Report downloaded successfully!");
    } catch (err: any) {
      console.error('Failed to generate PDF', err);
      toast.error("Error generating PDF: " + (err?.message || "Unknown error"));
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const toggleItem = (secId: string, itemId: string, field: 'selfDone' | 'compDone') =>
    setSections(prev => prev.map(s => s.id !== secId ? s : {
      ...s, items: s.items.map(i => i.id !== itemId ? i : { ...i, [field]: !i[field] })
    }));

  const toggleSection = (secId: string) =>
    setSections(prev => prev.map(s => s.id === secId ? { ...s, open: !s.open } : s));

  const resetAll = () => {
    setSections(prev => prev.map(s => ({ ...s, items: s.items.map(i => ({ ...i, selfDone:false, compDone:false })) })));
    setNotes({});
  };

  const allItems  = sections.flatMap(s => s.items);
  const selfTotal = allItems.filter(i => i.selfDone).length;
  const compTotal = allItems.filter(i => i.compDone).length;
  const total     = allItems.length;
  const selfPct   = Math.round(selfTotal / total * 100);
  const compPct   = Math.round(compTotal / total * 100);

  return (
    <div className="flex-1 overflow-y-auto relative z-0" style={{ background:'var(--slate-50)', padding:'1.5rem' }}>
      <div ref={reportRef} style={{ position: 'absolute', top: 0, left: 0, opacity: 0, pointerEvents: 'none', width: '794px' }}>
        <ProfileAuditReport sections={sections} />
      </div>
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:'var(--brand-600)' }}>
              <ClipboardList size={20} color="#fff" strokeWidth={2}/>
            </div>
            <div>
              <h1 className="text-2xl font-black" style={{ fontFamily:'Outfit,sans-serif', color:'var(--slate-900)' }}>{t('profileAudit.title', 'Profile & Competitor Audit')}</h1>
              <p className="text-sm" style={{ color:'var(--slate-500)' }}>{t('profileAudit.subtitle', "2-month analysis checklist — your profile vs competitor's Facebook")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={generatePDF} disabled={isGeneratingReport}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${isGeneratingReport ? 'bg-slate-200 text-slate-500' : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'}`}
              style={{boxShadow:'0 2px 4px rgba(0,0,0,0.05)'}}>
              {isGeneratingReport ? (
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                ) : <Download size={16}/>}
              {isGeneratingReport ? t('dashboard.report.downloading', 'Generating...') : 'Download PDF'}
            </button>
            <button onClick={resetAll}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm border transition-colors hover:bg-slate-50"
              style={{ borderColor:'var(--slate-200)', color:'var(--slate-500)' }}>
              <RefreshCw size={14}/> {t('profileAudit.resetAll', 'Reset All')}
            </button>
          </div>
        </div>

        {/* Score Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {[
            { label:t('profileAudit.cards.yourScore', 'Your Profile Score'), pct:selfPct, count:`${selfTotal}/${total}`, desc:t('profileAudit.cards.itemsCompleted', 'items completed') },
            { label:t('profileAudit.cards.compScore', 'Competitor Score'),   pct:compPct, count:`${compTotal}/${total}`, desc:t('profileAudit.cards.itemsChecked', 'items checked'),
              extra: (
                <select style={{ ...inputStyle, width:'auto', fontSize:'0.75rem', padding:'0.3rem 0.6rem' }}
                  value={competitor} onChange={e => setCompetitor(e.target.value)}>
                  {COMPETITORS.map(c => <option key={c} value={c}>{t(`profileAudit.competitors.${c}`, c)}</option>)}
                </select>
              )
            },
          ].map(card => (
            <div key={card.label} className="bg-white rounded-2xl border p-5" style={{ borderColor:'var(--slate-200)' }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color:'var(--slate-400)' }}>{card.label}</p>
                {card.extra}
              </div>
              <div className="flex items-end gap-4">
                <div className="text-5xl font-black" style={{ color:scoreColor(card.pct) }}>{card.pct}%</div>
                <div className="flex-1 pb-2">
                  <div className="h-3 rounded-full overflow-hidden mb-1" style={{ background:'var(--slate-100)' }}>
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width:`${card.pct}%`, background:'var(--brand-500)' }}/>
                  </div>
                  <p className="text-xs" style={{ color:'var(--slate-500)' }}>{card.count} {card.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Advantage Banner */}
        {selfPct !== compPct && (
          <div className="flex items-center gap-3 p-4 rounded-2xl mb-6"
            style={{ background:'var(--brand-50)', border:'1px solid var(--brand-100)' }}>
            {selfPct > compPct
              ? <TrendingUp size={20} style={{ color:'var(--brand-600)', flexShrink:0 }}/>
              : <ShieldAlert size={20} style={{ color:'var(--brand-600)', flexShrink:0 }}/>}
            <p className="font-bold text-sm" style={{ color:'var(--brand-800)' }}>
              {selfPct > compPct
                ? t('profileAudit.advantage.ahead', 'You are ahead by {{pct}}% — keep it up!', { pct: selfPct - compPct })
                : t('profileAudit.advantage.behind', 'Competitor is ahead by {{pct}}% — need to catch up!', { pct: compPct - selfPct })}
            </p>
          </div>
        )}

        {/* Tab switcher */}
        <div className="flex gap-1 mb-5 bg-white rounded-xl p-1 border w-fit" style={{ borderColor:'var(--slate-200)' }}>
          {(['self','compare'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="flex items-center gap-2 px-5 py-2 rounded-lg font-bold text-sm transition-all"
              style={{ background:activeTab===tab?'var(--brand-600)':'transparent', color:activeTab===tab?'#fff':'var(--slate-600)' }}>
              {tab === 'self'
                ? <><User size={14}/> {t('profileAudit.tabs.myProfile', 'My Profile')}</>
                : <><BarChart2 size={14}/> {t('profileAudit.tabs.sideBySide', 'Side-by-Side')}</>}
            </button>
          ))}
        </div>

        {/* Checklist Sections */}
        <div className="space-y-3">
          {sections.map(section => {
            const SIcon = section.Icon;
            const doneCnt = section.items.filter(i => i.selfDone).length;
            return (
              <div key={section.id} className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor:'var(--slate-200)' }}>
                <button onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:'var(--brand-50)', color:'var(--brand-600)' }}>
                      <SIcon size={17} strokeWidth={2}/>
                    </div>
                    <div>
                      <h3 className="font-bold" style={{ color:'var(--slate-900)' }}>{t(`profileAudit.sections.${section.id}.title`, section.title)}</h3>
                      <p className="text-xs" style={{ color:'var(--slate-500)' }}>{t('profileAudit.section.done', '{{done}}/{{total}} done', { done: doneCnt, total: section.items.length })}</p>
                    </div>
                  </div>
                  {section.open
                    ? <ChevronUp size={18} style={{ color:'var(--slate-400)' }}/>
                    : <ChevronDown size={18} style={{ color:'var(--slate-400)' }}/>}
                </button>

                {section.open && (
                  <div className="border-t px-5 pb-4" style={{ borderColor:'var(--slate-100)' }}>
                    {activeTab === 'compare' && (
                      <div className="grid grid-cols-[1fr_auto_auto] gap-4 py-2 mb-1">
                        <div/>
                        <div className="text-xs font-bold text-center w-20" style={{ color:'var(--brand-600)' }}>{t('profileAudit.section.you', 'You')}</div>
                        <div className="text-xs font-bold text-center w-20" style={{ color:'var(--slate-500)' }}>{t(`profileAudit.competitors.${competitor}`, competitor)}</div>
                      </div>
                    )}
                    <div className="space-y-1">
                      {section.items.map(item => (
                        <div key={item.id}>
                          {activeTab === 'self' ? (
                            <button onClick={() => toggleItem(section.id, item.id, 'selfDone')}
                              className="w-full flex items-start gap-3 p-3 rounded-xl text-left transition-colors hover:bg-slate-50">
                              {item.selfDone
                                ? <CheckSquare size={18} className="shrink-0 mt-0.5" style={{ color:'var(--brand-600)' }}/>
                                : <Square size={18} className="shrink-0 mt-0.5" style={{ color:'var(--slate-300)' }}/>}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium"
                                  style={{ color:item.selfDone?'var(--slate-400)':'var(--slate-900)', textDecoration:item.selfDone?'line-through':'none' }}>
                                  {t(`profileAudit.sections.${section.id}.${item.id}`, item.label)}
                                </p>
                                {item.tip && <p className="text-xs mt-0.5" style={{ color:'var(--slate-400)' }}>{item.tip}</p>}
                              </div>
                            </button>
                          ) : (
                            <div className="grid grid-cols-[1fr_auto_auto] gap-4 items-center p-3 rounded-xl hover:bg-slate-50">
                              <p className="text-sm font-medium" style={{ color:'var(--slate-800)' }}>{t(`profileAudit.sections.${section.id}.${item.id}`, item.label)}</p>
                              <button onClick={() => toggleItem(section.id, item.id, 'selfDone')} className="w-20 flex justify-center">
                                {item.selfDone
                                  ? <CheckSquare size={20} style={{ color:'var(--brand-600)' }}/>
                                  : <Square size={20} style={{ color:'var(--slate-300)' }}/>}
                              </button>
                              <button onClick={() => toggleItem(section.id, item.id, 'compDone')} className="w-20 flex justify-center">
                                {item.compDone
                                  ? <CheckSquare size={20} style={{ color:'var(--brand-500)' }}/>
                                  : <Square size={20} style={{ color:'var(--slate-300)' }}/>}
                              </button>
                            </div>
                          )}
                          {activeTab === 'self' && item.selfDone && (
                            <div className="ml-9 mb-1">
                              <input style={{ ...inputStyle, fontSize:'0.78rem' }}
                                placeholder={String(t('profileAudit.notePlaceholder', 'Add note or data point…'))}
                                value={notes[item.id] || ''}
                                onChange={e => setNotes(n => ({ ...n, [item.id]:e.target.value }))}/>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-6 bg-white rounded-2xl border p-5" style={{ borderColor:'var(--slate-200)' }}>
          <h3 className="font-bold mb-4 flex items-center gap-2" style={{ fontFamily:'Outfit,sans-serif', color:'var(--slate-900)' }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background:'var(--brand-50)', color:'var(--brand-600)' }}>
              <BarChart2 size={14} strokeWidth={2}/>
            </div>
            {t('profileAudit.summary.title', 'Audit Summary')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {sections.map(s => {
              const pct = Math.round(s.items.filter(i => i.selfDone).length / s.items.length * 100);
              const SIcon = s.Icon;
              return (
                <div key={s.id} className="p-4 rounded-xl border" style={{ borderColor:'var(--slate-100)', background:scoreBg(pct) }}>
                  <div className="flex items-center gap-2 mb-3">
                    <SIcon size={14} style={{ color:'var(--brand-600)' }}/>
                    <p className="text-sm font-bold truncate" style={{ color:'var(--slate-700)' }}>{t(`profileAudit.sections.${s.id}.title`, s.title)}</p>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden mb-1.5" style={{ background:'var(--slate-200)' }}>
                    <div className="h-full rounded-full transition-all"
                      style={{ width:`${pct}%`, background:'var(--brand-500)' }}/>
                  </div>
                  <p className="text-xs font-bold" style={{ color:scoreColor(pct) }}>{t('profileAudit.summary.complete', '{{pct}}% complete', { pct })}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
