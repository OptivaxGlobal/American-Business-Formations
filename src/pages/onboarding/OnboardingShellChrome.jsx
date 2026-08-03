import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react'

// The sidebar/progress-bar/back-continue chrome shared by every step —
// extracted from the single 322-line Onboarding.jsx so step content and
// wizard chrome can be reasoned about separately.
export default function OnboardingShellChrome({ wizard, children }) {
  const { step, steps, formError, loading, goBack, goNext, submitPayment } = wizard

  return (
    <section className="onboarding-page">
      <a href="#onboarding-main" className="skip-link">Skip to main content</a>
      <div className="onboarding-shell">
      <aside>
        <div className="onboarding-brand"><img src="/logo.webp" alt="American Business Formations" className="brand-mini-light" width="1500" height="486" /></div>
        <h2>Let&rsquo;s form your LLC.</h2>
        <p>Your answers save automatically as you go.</p>
        <ol>{steps.map((label, i) => <li key={label} className={i === step ? 'active' : i < step ? 'done' : ''}><span>{i < step ? <Check /> : i + 1}</span>{label}</li>)}</ol>
        <small>General information only. This workflow is not legal or tax advice.</small>
      </aside>
      <main id="onboarding-main" tabIndex={-1}>
        <div className="onboarding-progress"><span aria-live="polite">Step {step + 1} of {steps.length}</span><div><i style={{ width: `${((step + 1) / steps.length) * 100}%` }}></i></div></div>
        {formError && step < 14 && <p className="form-error-summary" role="alert">{formError}</p>}

        {children}

        {step < 14 && (
          <div className="onboarding-actions">
            {step > 0 ? <button className="btn btn-ghost" onClick={goBack}><ArrowLeft /> Back</button> : <span />}
            {step < 13
              ? <button className="btn btn-primary" onClick={goNext}>Continue <ArrowRight /></button>
              : <button className="btn btn-primary" disabled={loading} aria-busy={loading} onClick={submitPayment}>{loading && <Loader2 className="spin" size={18} />}<span aria-live="polite">{loading ? 'Processing...' : 'Complete purchase'}</span> <ArrowRight /></button>}
          </div>
        )}
      </main>
      </div>
    </section>
  )
}
