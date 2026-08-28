import logoSrc from '../assets/money-bag.png'

export default function Logo({ size = 36, showText = true, className = '' }) {
  return (
    <span className={`logo ${className}`.trim()}>
      <img src={logoSrc} alt="BudgetWise" width={size} height={size} className="logo-mark" />
      {showText && <span className="logo-text">BudgetWise</span>}
    </span>
  )
}
