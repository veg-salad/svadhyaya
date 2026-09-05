import { Icon } from '@iconify/react';

import { useTheme } from '../theme';

/** Small round toggle showing a sundial or half-moon (Iconify game-icons). */
export default function ThemeToggle(): JSX.Element {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={toggle}
      className="btn-icon"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Sūrya · Light mode' : 'Chandra · Dark mode'}
    >
      <Icon
        icon={isDark ? 'game-icons:sundial' : 'game-icons:half-moon'}
        className="h-5 w-5 text-terracotta"
      />
    </button>
  );
}
