import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      <img
        src={isDark ? '/icons/sun.svg' : '/icons/moon.svg'}
        alt=""
        width={20}
        height={20}
        className="theme-toggle-icon"
      />
    </button>
  )
}
