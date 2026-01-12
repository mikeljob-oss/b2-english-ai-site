import Link from "next/link";

export default function Page() {
  return (
    <main>
      <div className="hero">
        <h1>Random B2 English practice for students</h1>
        <p>
          Use Grammar for quick, auto-graded exercises and Writing for rubric-based feedback. 
          Answers are shown only after submission.
        </p>
        <hr className="sep" />
        <div className="row">
          <Link href="/grammar" className="primary">Start Grammar</Link>
          <Link href="/writing" className="secondary">Start Writing</Link>
        </div>
        <div className="small" style={{marginTop: "12px"}}>
          Tip: After each submission, the site stores a lightweight “learner profile” in your browser (localStorage) to target weak areas.
        </div>
      </div>

      <div className="grid">
        <div className="card">
          <h2>Grammar</h2>
          <p>Mixed B2 items: multiple choice, gap fill, transformations, and error correction. Immediate scoring.</p>
          <Link href="/grammar" className="secondary">Open Grammar</Link>
        </div>
        <div className="card">
          <h2>Writing</h2>
          <p>B2 tasks (email/report/essay). Get rubric feedback, targeted corrections, and next-step recommendations.</p>
          <Link href="/writing" className="secondary">Open Writing</Link>
        </div>
      </div>
    </main>
  );
}
