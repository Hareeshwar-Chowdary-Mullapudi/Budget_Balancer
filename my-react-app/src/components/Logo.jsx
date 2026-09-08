export default function Logo({ size = 36, showText = true, className = '' }) {
  return (
    <span className={`logo ${className}`.trim()}>
      <img src="/icons/money-bag.png" alt="BudgetWise" width={size} height={size} className="logo-mark" />
      {showText && <span className="logo-text">BudgetWise</span>}
    </span>
  )
}
