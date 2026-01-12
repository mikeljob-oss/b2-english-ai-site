import "../styles/globals.css";
import Link from "next/link";

export const metadata = {
  title: "B2 English Practice",
  description: "Random B2 grammar and writing practice with instant feedback."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <div className="nav">
            <div className="brand">
              <strong>B2 English Practice</strong>
              <span>Random grammar + writing tasks with feedback</span>
            </div>
            <div className="navlinks">
              <Link className="pill" href="/">Home</Link>
              <Link className="pill" href="/grammar">Grammar</Link>
              <Link className="pill" href="/writing">Writing</Link>
            </div>
          </div>
          {children}
          <div className="footer">
            <div><strong>Note:</strong> This is a teaching tool. If OpenAI is not configured, the site runs in demo mode with prebuilt exercises.</div>
            <div>To enable AI generation and personalised feedback, set <span className="kbd">OPENAI_API_KEY</span> and <span className="kbd">APP_SECRET</span>.</div>
          </div>
        </div>
      </body>
    </html>
  );
}
