import { Chakra, Chandra, Surya } from './IndicIcons';

import { useTheme } from '../theme';

/** Small round toggle — chakra frames a rotating Sūrya/Chandra glyph. */
export default function ThemeToggle(): JSX.Element {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={toggle}
      className="group btn-icon relative overflow-hidden"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Sūrya · Light mode' : 'Chandra · Dark mode'}
    >
      <Chakra className="absolute inset-1 h-6 w-6 text-terracotta/30 transition-transform duration-700 group-hover:rotate-45" />
      {isDark ? (
        <Surya className="relative h-3.5 w-3.5 text-terracotta" />
      ) : (
        <Chandra className="relative h-3.5 w-3.5 text-terracotta" />
      )}
    </button>
  );
}
