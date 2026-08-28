export default function Logo({ size = 28, showText = true, className = '' }) {
  return (
    <span className={`logo ${className}`.trim()}>
      <img src="/logo.svg" alt="" width={size} height={size} className="logo-mark" />
      {showText && <span className="logo-text">BudgetWise</span>}
    </span>
  )
}
