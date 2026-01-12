"use client";

import { useEffect, useMemo, useState } from "react";

 type Item =
   | { item_id: string; type: "mcq"; prompt: string; options: string[] }
   | { item_id: string; type: "gap_fill"; prompt: string; note?: string }
   | { item_id: string; type: "sentence_transformation"; prompt: string; note?: string }
   | { item_id: string; type: "error_correction"; prompt: string; note?: string };
 
 type StudentView = {
   title: string;
   instructions: string;
   items: Item[];
 };
 
 type NewExerciseResponse = {
   exercise_id: string;
   expires_at: string;
   student_view: StudentView;
   submission_token: string;
 };
 
 type SubmitResponse = {
   score: { correct: number; total: number };
   results: Array<{
     item_id: string;
     is_correct: boolean;
     correct_answer: string;
     explanation: string;
     error_tag: string | null;
   }>;
   personalised_feedback: {
     top_strengths: string[];
     top_focus_areas: Array<{ tag: string; tip: string }>;
     next_step: string;
   };
   recommended_next_request?: {
     mode: "grammar";
     level: "B2";
     count: number;
     target_tags: string[];
     topic: string;
   };
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
 export default function GrammarPage() {
   const [topic, setTopic] = useState<string>("random");
   const [loading, setLoading] = useState(false);
   const [exercise, setExercise] = useState<NewExerciseResponse | null>(null);
   const [answers, setAnswers] = useState<Record<string, string>>({});
   const [submitted, setSubmitted] = useState<SubmitResponse | null>(null);
   const [err, setErr] = useState<string | null>(null);

   const targetTags = useMemo(() => {
     const prof = getLearnerProfile();
     const entries = Object.entries(prof).sort((a, b) => b[1] - a[1]).slice(0, 2);
     return entries.map(([tag]) => tag);
   }, [exercise?.exercise_id]); // recompute after new exercise

   async function newExercise(customTargetTags?: string[]) {
     setErr(null);
     setSubmitted(null);
     setAnswers({});
     setLoading(true);
     try {
       const res = await fetch("/api/grammar/new", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
           session_id: "anon",
           mode: "grammar",
           level: "B2",
           count: 10,
           topic,
           target_tags: customTargetTags ?? targetTags,
           ui_lang: "en-GB"
         })
       });
       const data = await res.json();
       if (!res.ok) throw new Error(data?.error ?? "Failed to create exercise");
       setExercise(data);
     } catch (e: any) {
       setErr(e?.message ?? "Something went wrong");
     } finally {
       setLoading(false);
     }
   }
   async function submit() {
     if (!exercise) return;
     setErr(null);
     setLoading(true);
     const payload = {
       exercise_id: exercise.exercise_id,
       submission_token: exercise.submission_token,
       answers: Object.entries(answers).map(([item_id, value]) => ({ item_id, value })),
       client_meta: { seconds_spent: 0 }
     };
     try {
       const res = await fetch("/api/grammar/submit", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(payload)
       });
       const data = await res.json();
       if (!res.ok) throw new Error(data?.error ?? "Failed to submit");
       setSubmitted(data);
       // Update learner profile (local, lightweight)
       const profile = getLearnerProfile();
       for (const r of data.results) {
         if (!r.is_correct && r.error_tag) {
           profile[r.error_tag] = (profile[r.error_tag] ?? 0) + 1;
         }
       }
       setLearnerProfile(profile);
     } catch (e: any) {
       setErr(e?.message ?? "Something went wrong");
     } finally {
       setLoading(false);
     }
   }
   useEffect(() => {
     // auto-load first exercise
     newExercise();
     // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);
   return (
     <main>
       <div className="hero">
         <h1>Grammar (B2)</h1>
         <p>
           Mixed item types. Submit to see answers, explanations, and personalised feedback.
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
               <button className="secondary" onClick={() => newExercise()} disabled={loading}>
                 {loading ? "Loading..." : "New exercise"}
               </button>
               {targetTags.length > 0 && (
                 <span className="badge">Targeting: <span className="kbd">{targetTags.join(", ")}</span></span>
               )}
             </div>
             {err && <p className="small" style={{color: "var(--danger)", marginTop: 10}}>{err}</p>}
           </div>
         </div>
       </div>
       {exercise && (
         <div className="hero" style={{marginTop: 14}}>
           <h2 style={{marginTop: 0}}>{exercise.student_view.title}</h2>
           <p className="small">{exercise.student_view.instructions}</p>
           {exercise.student_view.items.map((it, idx) => (
             <div className="item" key={it.item_id}>
               <h3>Item {idx + 1} <span className="badge">{it.type}</span></h3>
               <div className="prompt">{it.prompt}</div>
               {it.type === "mcq" && (
                 <div>
                   {it.options.map((opt) => (
                     <label key={opt} className="option">
                       <input
                         type="radio"
                         name={it.item_id}
                         value={opt}
                         checked={answers[it.item_id] === opt}
                         onChange={(e) => setAnswers((a) => ({ ...a, [it.item_id]: e.target.value }))}
                       />
                       <span>{opt}</span>
                     </label>
                   ))}
                 </div>
               )}
               {it.type !== "mcq" && (
                 <div className="field">
                   <label>Your answer</label>
                   <input
                     value={answers[it.item_id] ?? ""}
                     onChange={(e) => setAnswers((a) => ({ ...a, [it.item_id]: e.target.value }))}
                     placeholder="Type your answer…"
                   />
                   {("note" in it && it.note) ? <div className="small">{it.note}</div> : null}
                 </div>
               )}
               {submitted && (
                 <div className="result" style={{marginTop: 10}}>
                   {(() => {
                     const r = submitted.results.find(x => x.item_id === it.item_id);
                     if (!r) return null;
                     return (
                       <>
                         <div className={r.is_correct ? "good" : "bad"} style={{fontWeight: 800}}>
                           {r.is_correct ? "Correct" : "Not correct"}
                         </div>
                         <div className="small" style={{marginTop: 6}}>
                           <strong>Correct answer:</strong> {r.correct_answer}
                         </div>
                         <div className="small" style={{marginTop: 6}}>
                           <strong>Explanation:</strong> {r.explanation}
                         </div>
                       </>
                     );
                   })()}
                 </div>
               )}
             </div>
           ))}
           <div className="row" style={{marginTop: 12}}>
             <button className="primary" onClick={submit} disabled={loading || !!submitted}>
               {loading ? "Submitting..." : (submitted ? "Submitted" : "Submit")}
             </button>
             <button className="secondary" onClick={() => newExercise()} disabled={loading}>
               New random set
             </button>
             {submitted?.recommended_next_request?.target_tags?.length ? (
               <button
                 className="secondary"
                 onClick={() => newExercise(submitted.recommended_next_request!.target_tags)}
                 disabled={loading}
               >
                 Practice weak points
               </button>
             ) : null}
           </div>
           {submitted && (
             <>
               <hr className="sep" />
               <h3 style={{margin: "0 0 10px 0"}}>Personalised feedback</h3>
               <div className="small">
                 <div><strong>Strengths:</strong> {submitted.personalised_feedback.top_strengths.join(", ") || "—"}</div>
                 <div style={{marginTop: 8}}><strong>Focus areas:</strong></div>
                 <ul>
                   {submitted.personalised_feedback.top_focus_areas.map((fa) => (
                     <li key={fa.tag}><span className="kbd">{fa.tag}</span> — {fa.tip}</li>
                   ))}
                 </ul>
                 <div><strong>Next step:</strong> {submitted.personalised_feedback.next_step}</div>
               </div>
             </>
           )}
         </div>
       )}
     </main>
   );
 }
