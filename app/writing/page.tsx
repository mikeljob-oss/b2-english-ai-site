"use client";

import { useEffect, useMemo, useState } from "react";

 type WritingTask = {
   task_id: string;
   level: "B2";
   genre: "email" | "essay" | "report" | "review";
   title: string;
   prompt: string;
   word_range: { min: number; max: number };
 };

 type NewWritingResponse = {
   task: WritingTask;
   submission_token: string;
 };

 type WritingFeedback = {
   rubric: {
     content: { band: string; evidence: string };
     communicative_achievement: { band: string; evidence: string };
     organisation: { band: string; evidence: string };
     language: { band: string; evidence: string };
   };
   priority_actions: string[];
   targeted_corrections: Array<{ quote: string; issue: string; better: string }>;
   one_paragraph_improved_example: string;
   personalised_next_step: string;
   detected_tags: string[];
 };
 function getLearnerProfile(): Record<string, number> {
   try {
     const raw = localStorage.getItem("learner_profile_v1");
     if (!raw) return {};
     const parsed = JSON.parse(raw);
     return parsed && typeof parsed === "object" ? parsed : {};
   } catch {
     return {};
   }
 }
 function setLearnerProfile(profile: Record<string, number>) {
   localStorage.setItem("learner_profile_v1", JSON.stringify(profile));
 }
 export default function WritingPage() {
   const [topic, setTopic] = useState("random");
   const [loading, setLoading] = useState(false);
   const [task, setTask] = useState<NewWritingResponse | null>(null);
   const [text, setText] = useState("");
   const [feedback, setFeedback] = useState<WritingFeedback | null>(null);
   const [err, setErr] = useState<string | null>(null);
   const targetTags = useMemo(() => {
     const prof = getLearnerProfile();
     const entries = Object.entries(prof).sort((a, b) => b[1] - a[1]).slice(0, 2);
     return entries.map(([tag]) => tag);
   }, [task?.task.task_id]);
   const wordCount = useMemo(() => {
     const trimmed = text.trim();
     if (!trimmed) return 0;
     return trimmed.split(/\s+/).length;
   }, [text]);
   async function newTask() {
     setErr(null);
     setFeedback(null);
     setText("");
     setLoading(true);
     try {
       const res = await fetch("/api/writing/new", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
           session_id: "anon",
           level: "B2",
           topic,
           target_tags: targetTags
         })
       });
       const data = await res.json();
       if (!res.ok) throw new Error(data?.error ?? "Failed to create task");
       setTask(data);
     } catch (e: any) {
       setErr(e?.message ?? "Something went wrong");
     } finally {
       setLoading(false);
     }
   }
   async function submit() {
     if (!task) return;
     setErr(null);
     setLoading(true);
     try {
       const res = await fetch("/api/writing/submit", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
           session_id: "anon",
           task_id: task.task.task_id,
           submission_token: task.submission_token,
           text
         })
       });
       const data = await res.json();
       if (!res.ok) throw new Error(data?.error ?? "Failed to submit");
       setFeedback(data);
       // Update learner profile using detected tags (lightweight)
       const profile = getLearnerProfile();
       for (const t of data.detected_tags ?? []) {
         profile[t] = (profile[t] ?? 0) + 1;
       }
       setLearnerProfile(profile);
     } catch (e: any) {
       setErr(e?.message ?? "Something went wrong");
     } finally {
       setLoading(false);
     }
   }
   useEffect(() => {
     newTask();
     // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);
   return (
     <main>
       <div className="hero">
         <h1>Writing (B2)</h1>
         <p>
           Submit your writing to receive rubric-based feedback, targeted corrections, and next steps.
         </p>
         <div className="grid" style={{marginTop: 10}}>
           <div className="card" style={{gridColumn: "span 12"}}>
             <div className="row">
               <div style={{minWidth: 240}}>
                 <label>Topic</label>
                 <select value={topic} onChange={(e) => setTopic(e.target.value)}>
                   <option value="random">Random</option>
                   <option value="work">Work</option>
                   <option value="education">Education</option>
                   <option value="travel">Travel</option>
                   <option value="culture">Culture</option>
                   <option value="technology">Technology</option>
                   <option value="health">Health</option>
                 </select>
               </div>
               <button className="secondary" onClick={newTask} disabled={loading}>
                 {loading ? "Loading..." : "New task"}
               </button>
               {targetTags.length > 0 && (
                 <span className="badge">Targeting: <span className="kbd">{targetTags.join(", ")}</span></span>
               )}
             </div>
             {err && <p className="small" style={{color: "var(--danger)", marginTop: 10}}>{err}</p>}
           </div>
         </div>
       </div>
       {task && (
         <div className="hero" style={{marginTop: 14}}>
           <h2 style={{marginTop: 0}}>{task.task.title} <span className="badge">{task.task.genre}</span></h2>
           <div className="small" style={{marginTop: 6}}>
             Word range: <span className="kbd">{task.task.word_range.min}–{task.task.word_range.max}</span>
           </div>
           <hr className="sep" />
           <div className="prompt">{task.task.prompt}</div>
           <div className="field">
             <label>Your writing</label>
             <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Write here…"></textarea>
             <div className="small">Word count: <span className={wordCount >= task.task.word_range.min && wordCount <= task.task.word_range.max ? "good" : "bad"} style={{fontWeight: 800}}>{wordCount}</span></div>
           </div>
           <div className="row">
             <button className="primary" onClick={submit} disabled={loading || !text.trim()}>
               {loading ? "Submitting..." : "Submit"}
             </button>
             <button className="secondary" onClick={newTask} disabled={loading}>
               New prompt
             </button>
           </div>
           {feedback && (
             <>
               <hr className="sep" />
               <h3 style={{margin: "0 0 10px 0"}}>Feedback</h3>
               <div className="grid">
                 <div className="card" style={{gridColumn: "span 12"}}>
                   <h2>Rubric</h2>
                   <div className="small">
                     <div><strong>Content:</strong> {feedback.rubric.content.band} — {feedback.rubric.content.evidence}</div>
                     <div style={{marginTop: 8}}><strong>Communicative Achievement:</strong> {feedback.rubric.communicative_achievement.band} — {feedback.rubric.communicative_achievement.evidence}</div>
                     <div style={{marginTop: 8}}><strong>Organisation:</strong> {feedback.rubric.organisation.band} — {feedback.rubric.organisation.evidence}</div>
                     <div style={{marginTop: 8}}><strong>Language:</strong> {feedback.rubric.language.band} — {feedback.rubric.language.evidence}</div>
                   </div>
                 </div>
                 <div className="card" style={{gridColumn: "span 6"}}>
                   <h2>Priority actions</h2>
                   <ul className="small">
                     {feedback.priority_actions.map((p, i) => <li key={i}>{p}</li>)}
                   </ul>
                   <div className="small"><strong>Next step:</strong> {feedback.personalised_next_step}</div>
                 </div>
                 <div className="card" style={{gridColumn: "span 6"}}>
                   <h2>Targeted corrections</h2>
                   <div className="small">
                     {feedback.targeted_corrections.slice(0, 10).map((c, i) => (
                       <div key={i} style={{marginBottom: 10}}>
                         <div><span className="badge">{c.issue}</span></div>
                         <div style={{marginTop: 6}}><strong>Original:</strong> {c.quote}</div>
                         <div style={{marginTop: 6}}><strong>Better:</strong> {c.better}</div>
                       </div>
                     ))}
                   </div>
                 </div>
                 <div className="card" style={{gridColumn: "span 12"}}>
                   <h2>Improved example (one paragraph)</h2>
                   <div className="small">{feedback.one_paragraph_improved_example}</div>
                   {feedback.detected_tags?.length ? (
                     <div className="small" style={{marginTop: 12}}>
                       <strong>Detected focus tags:</strong> {feedback.detected_tags.map(t => <span key={t} className="kbd" style={{marginRight: 6}}>{t}</span>)}
                     </div>
                   ) : null}
                 </div>
               </div>
             </>
           )}
         </div>
       )}
     </main>
   );
 }
