import { LoginForm } from '@/components/LoginForm';

const UI_FONT = "'Hanken Grotesk', system-ui, sans-serif";
const DISPLAY_FONT = "'Instrument Serif', Georgia, serif";

// The signed-out home screen. The statement and the form share one grid;
// the form sits flat on the page, separated by a hairline rule.
export function SignInScreen() {
  return (
    <main className="min-h-screen" style={{ background: '#E8EAED', color: '#121417', fontFamily: UI_FONT }}>
      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-12 px-6 py-16 md:grid-cols-12 md:gap-0 md:px-10">
        <section className="signin-rise md:col-span-7 md:pr-16">
          <h2
            style={{ fontFamily: DISPLAY_FONT, fontSize: 'clamp(3rem, 8vw, 6.5rem)', lineHeight: 0.95, letterSpacing: '-0.01em', fontWeight: 400 }}
          >
            Your work, on your own page.
          </h2>
          <p className="mt-6 max-w-md text-lg" style={{ color: '#4A515C' }}>
            Sign in to keep editing your pages and publish changes when they are ready.
          </p>
        </section>
        <section className="md:col-span-5 md:border-l md:pl-12" style={{ borderColor: '#B9BFC8' }}>
          <LoginForm embedded />
        </section>
      </div>
      <style>{`
        @keyframes signin-rise { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
        .signin-rise { animation: signin-rise 0.6s cubic-bezier(0.2, 0.7, 0.2, 1) both; }
        @media (prefers-reduced-motion: reduce) { .signin-rise { animation: none; } }
      `}</style>
    </main>
  );
}
