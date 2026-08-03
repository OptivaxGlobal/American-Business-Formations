// Wraps the existing .check-control label+checkbox pattern used throughout
// the app's forms (Onboarding, Login, Signup, Settings, etc.).
export default function Checkbox({ label, error, className = '', ...rest }) {
  return (
    <>
      <label className={`check-control ${className}`.trim()}>
        <input type="checkbox" {...rest} />
        {label}
      </label>
      {error && <p className="field-error">{error}</p>}
    </>
  )
}
