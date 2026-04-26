'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Compass,
  Trophy,
  Users,
  Clock,
  Star,
  Bookmark,
  Calendar,
  Search,
  Settings,
} from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
}

const MENU_ITEMS: NavItem[] = [
  { label: 'Home',        href: '/',                      icon: Home     },
  { label: 'Discover',    href: '/browse/movies',          icon: Compass  },
  { label: 'Awards',      href: '/lists',                  icon: Trophy   },
  { label: 'Celebrities', href: '/person/trending',        icon: Users    },
]

const LIBRARY_ITEMS: NavItem[] = [
  { label: 'Recent',    href: '/watchlist',                    icon: Clock    },
  { label: 'Top Rated', href: '/browse/movies?sort=top_rated', icon: Star     },
  { label: 'Watchlist', href: '/watchlist',                    icon: Bookmark },
  { label: 'Upcoming',  href: '/upcoming',                     icon: Calendar },
]

const BOTTOM_ITEMS: NavItem[] = [
  { label: 'Search',   href: '/search', icon: Search   },
  { label: 'Settings', href: '#',       icon: Settings },
]

function useIsActive(href: string): boolean {
  const pathname = usePathname()
  if (href === '/') return pathname === '/'
  // Strip query string for prefix matching
  return pathname === href || pathname.startsWith(href.split('?')[0])
}

interface SidebarLinkProps {
  item: NavItem
}

function SidebarLink({ item }: SidebarLinkProps) {
  const active = useIsActive(item.href)
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      className={[
        'flex items-center gap-3 px-3 py-2.5 mx-2 rounded-[10px] text-sm transition-all duration-150',
        active
          ? 'text-[#e50914] bg-[rgba(229,9,20,0.08)]'
          : 'text-[rgba(255,255,255,0.4)] hover:bg-[rgba(255,255,255,0.03)] hover:text-white',
        // When collapsed (lg width = 48px): center the icon, clip text
        'lg:justify-start justify-center',
      ].join(' ')}
    >
      <Icon size={17} className="shrink-0" />
      {/* Text is visible on full-width sidebar; hidden when collapsed at lg breakpoint */}
      <span className="truncate hidden lg:block">{item.label}</span>
    </Link>
  )
}

interface SectionLabelProps {
  text: string
}

function SectionLabel({ text }: SectionLabelProps) {
  return (
    <p
      className="
        hidden lg:block
        text-[10px] font-semibold tracking-[2px]
        text-[rgba(255,255,255,0.2)]
        px-4 mb-2
      "
    >
      {text}
    </p>
  )
}

export function Sidebar() {
  return (
    <aside
      className="
        fixed left-0 top-0 h-screen z-40
        flex flex-col
        bg-[#0f0f18]
        border-r border-[rgba(255,255,255,0.06)]
        /* Mobile: hidden — bottom tab bar handles navigation */
        hidden
        /* md–lg: icon-only collapsed rail (48px) */
        md:flex md:w-12
        /* lg+: full expanded sidebar (220px) */
        lg:w-[220px]
      "
    >
      {/* Logo */}
      <div className="p-5 flex items-center justify-center lg:justify-start shrink-0">
        <span
          className="
            font-extrabold tracking-[3px] text-[15px]
            hidden lg:block
          "
          style={{
            background: 'linear-gradient(135deg, #e50914, #ff4d58)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          CINESTREAM
        </span>
        {/* Collapsed state: show a small red dot as brand indicator */}
        <span
          className="block lg:hidden w-2 h-2 rounded-full bg-[#e50914]"
          aria-hidden="true"
        />
      </div>

      {/* Scrollable nav area */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col">
        {/* MENU section */}
        <div className="mt-6">
          <SectionLabel text="MENU" />
          <ul className="space-y-0.5">
            {MENU_ITEMS.map((item) => (
              <li key={item.href + item.label}>
                <SidebarLink item={item} />
              </li>
            ))}
          </ul>
        </div>

        {/* LIBRARY section */}
        <div className="mt-6">
          <SectionLabel text="LIBRARY" />
          <ul className="space-y-0.5">
            {LIBRARY_ITEMS.map((item) => (
              <li key={item.href + item.label}>
                <SidebarLink item={item} />
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Bottom pinned links */}
      <div
        className="
          mt-auto pt-4 pb-4
          border-t border-[rgba(255,255,255,0.06)]
        "
      >
        <ul className="space-y-0.5">
          {BOTTOM_ITEMS.map((item) => (
            <li key={item.href + item.label}>
              <SidebarLink item={item} />
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
