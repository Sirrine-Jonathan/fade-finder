'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import {
  Menu,
  X,
  Home,
  Search,
  Calendar,
  User as UserIcon,
  Scissors,
  ShieldAlert,
  LogOut,
  Settings,
  Briefcase,
  ChevronRight,
} from 'lucide-react';

export interface NavTab {
  id: string;
  label: string;
  count?: number;
  href?: string;
}

export interface NavbarProps {
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  tabs?: NavTab[];
  showAdminLink?: boolean;
}

const HeaderWrapper = styled.header`
  position: sticky;
  top: 0;
  z-index: 50;
  background: ${({ theme }) => theme.colors.surface};
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0.9rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;

  @media (max-width: 768px) {
    padding: 0.65rem 1rem;
  }
`;

const BrandLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  flex-shrink: 0;

  @media (max-width: 640px) {
    gap: 0.5rem;
  }
`;

const LogoImage = styled.img`
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 2px solid ${({ theme }) => theme.colors.primary};
  object-fit: cover;
  transition: transform ${({ theme }) => theme.transitions.fast};

  &:hover {
    transform: scale(1.05);
  }

  @media (max-width: 640px) {
    width: 34px;
    height: 34px;
  }
`;

const BrandText = styled.div`
  display: flex;
  flex-direction: column;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Title = styled.h1`
  font-size: 1.2rem;
  font-weight: 800;
  letter-spacing: -0.025em;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0;
  white-space: nowrap;

  @media (max-width: 640px) {
    font-size: 0.95rem;
  }
`;

const RoleBadge = styled.span<{ $role: string }>`
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.15rem 0.45rem;
  border-radius: ${({ theme }) => theme.radii.full};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: ${({ $role, theme }) =>
    $role === 'ADMIN'
      ? theme.colors.danger
      : $role === 'PROVIDER'
      ? theme.colors.secondary
      : theme.colors.primaryLight};
  color: ${({ $role, theme }) =>
    $role === 'ADMIN'
      ? '#ffffff'
      : $role === 'PROVIDER'
      ? '#ffffff'
      : theme.colors.primaryAccent};
`;

const Subtitle = styled.p`
  font-size: 0.7rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
  white-space: nowrap;

  @media (max-width: 640px) {
    display: none;
  }
`;

const DesktopNav = styled.nav`
  display: flex;
  align-items: center;
  gap: 0.75rem;

  @media (max-width: 768px) {
    display: none;
  }
`;

const DesktopNavLink = styled(Link)<{ $active?: boolean }>`
  padding: 0.45rem 0.85rem;
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  color: ${({ $active, theme }) =>
    $active ? theme.colors.primaryAccent : theme.colors.textSecondary};
  background-color: ${({ $active, theme }) =>
    $active ? theme.colors.primaryLight : 'transparent'};
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.textPrimary};
    background-color: ${({ theme }) => theme.colors.surfaceHover};
  }
`;

const ActionButton = styled(Link)`
  padding: 0.45rem 1rem;
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  background-color: ${({ theme }) => theme.colors.primary};
  color: #ffffff;
  transition: background-color ${({ theme }) => theme.transitions.fast};

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
  }
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.45rem 0.85rem;
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: 0.875rem;
  font-weight: 600;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.danger};
    border-color: ${({ theme }) => theme.colors.danger};
    background-color: rgba(239, 68, 68, 0.1);
  }
`;

const HamburgerButton = styled.button`
  display: none;
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.textPrimary};
  cursor: pointer;
  padding: 0.4rem;
  border-radius: ${({ theme }) => theme.radii.md};

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const MobileDrawerOverlay = styled.div<{ $open: boolean }>`
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  visibility: ${({ $open }) => ($open ? 'visible' : 'hidden')};
  transition: all 0.3s ease;
`;

const MobileDrawerContent = styled.div<{ $open: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 280px;
  max-width: 85vw;
  z-index: 101;
  background: ${({ theme }) => theme.colors.surface};
  border-left: 1px solid ${({ theme }) => theme.colors.cardBorder};
  transform: translateX(${({ $open }) => ($open ? '0' : '100%')});
  transition: transform 0.3s ease-in-out;
  display: flex;
  flex-direction: column;
  padding: 1.25rem;
  overflow-y: auto;
`;

const DrawerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 1rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.divider};
`;

const UserProfileSection = styled.div`
  padding: 0.75rem;
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.radii.md};
  margin-bottom: 1.25rem;
`;

const UserName = styled.p`
  font-weight: 700;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0 0 0.2rem 0;
`;

const UserEmail = styled.p`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
  word-break: break-all;
`;

const DrawerNavList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
`;

const DrawerNavLink = styled(Link)<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 0.9rem;
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  color: ${({ $active, theme }) =>
    $active ? theme.colors.primaryAccent : theme.colors.textPrimary};
  background-color: ${({ $active, theme }) =>
    $active ? theme.colors.primaryLight : 'transparent'};

  &:hover {
    background-color: ${({ theme }) => theme.colors.surfaceHover};
  }
`;

const DrawerLinkContent = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const MobileBottomNav = styled.nav`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 40;
    background: ${({ theme }) => theme.colors.surface};
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-top: 1px solid ${({ theme }) => theme.colors.cardBorder};
    padding: 0.4rem 0.5rem;
    justify-content: space-around;
    align-items: center;
  }
`;

const BottomNavItem = styled(Link)<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  text-decoration: none;
  font-size: 0.7rem;
  font-weight: 600;
  color: ${({ $active, theme }) =>
    $active ? theme.colors.primaryAccent : theme.colors.textMuted};
  padding: 0.3rem 0.6rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  transition: color ${({ theme }) => theme.transitions.fast};
`;

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  tabs,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  const { user, role, logout } = useAuth();

  const toggleDrawer = () => setDrawerOpen((prev) => !prev);
  const closeDrawer = () => setDrawerOpen(false);

  // Define default dynamic routes according to role
  const getNavLinks = () => {
    if (tabs && tabs.length > 0) {
      return tabs.map((tab) => ({
        label: tab.label,
        href: tab.href || '#',
        id: tab.id,
      }));
    }

    if (role === 'ADMIN') {
      return [
        { label: 'Admin Dashboard', href: '/admin', id: 'ADMIN' },
        { label: 'Site Content', href: '/admin/content', id: 'ADMIN_CONTENT' },
        { label: 'System Settings', href: '/admin/settings', id: 'ADMIN_SETTINGS' },
      ];
    }

    if (role === 'PROVIDER') {
      return [
        { label: 'Dashboard', href: '/providers', id: 'PORTAL' },
        { label: 'Status & Verification', href: '/providers/status', id: 'STATUS' },
        { label: 'Barber Profile', href: '/providers/profile/private', id: 'PROFILE' },
        { label: 'Analytics', href: '/providers/analytics', id: 'ANALYTICS' },
        { label: 'Settings', href: '/providers/settings', id: 'SETTINGS' },
      ];
    }

    if (role === 'CLIENT') {
      return [
        { label: 'Find Barbers', href: '/search', id: 'CLIENT' },
        { label: 'My Appointments', href: '/history', id: 'HISTORY' },
        { label: 'Profile', href: '/profile', id: 'PROFILE' },
        { label: 'Settings', href: '/settings', id: 'SETTINGS' },
      ];
    }

    // GUEST / Logged Out
    return [
      { label: 'Find Barbers', href: '/', id: 'HOME' },
      { label: 'Search Barbers', href: '/search', id: 'CLIENT' },
      { label: 'For Barbers', href: '/providers', id: 'PORTAL' },
    ];
  };

  const navLinks = getNavLinks();

  const isLinkActive = (href: string, id: string) => {
    if (activeTab) return activeTab === id;
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  // Dynamic bottom navigation items based on role
  const getBottomNavItems = () => {
    if (role === 'PROVIDER') {
      return [
        { label: 'Dashboard', href: '/providers', icon: Home },
        { label: 'Status', href: '/providers/status', icon: ShieldAlert },
        { label: 'Profile', href: '/providers/profile/private', icon: Scissors },
        { label: 'Settings', href: '/providers/settings', icon: Settings },
      ];
    }

    if (role === 'ADMIN') {
      return [
        { label: 'Dashboard', href: '/admin', icon: Home },
        { label: 'Content', href: '/admin/content', icon: Briefcase },
        { label: 'Settings', href: '/admin/settings', icon: Settings },
      ];
    }

    // CLIENT or GUEST
    return [
      { label: 'Home', href: '/', icon: Home },
      { label: 'Search', href: '/search', icon: Search },
      { label: 'Appointments', href: role === 'CLIENT' ? '/history' : '/login', icon: Calendar },
      { label: 'Profile', href: role === 'CLIENT' ? '/profile' : '/login', icon: UserIcon },
    ];
  };

  const bottomNavItems = getBottomNavItems();

  return (
    <>
      <HeaderWrapper>
        <Container>
          <BrandLink href="/">
            <LogoImage src="/logo.png" alt="Fade Finder Logo" />
            <BrandText>
              <TitleRow>
                <Title>FADE FINDER</Title>
                {role !== 'GUEST' && (
                  <RoleBadge $role={role} data-testid="nav-role-badge">
                    {role}
                  </RoleBadge>
                )}
              </TitleRow>
              <Subtitle>Local Barbers. On Demand.</Subtitle>
            </BrandText>
          </BrandLink>

          {/* Desktop Navigation */}
          <DesktopNav>
            {navLinks.map((link) => {
              const active = isLinkActive(link.href, link.id);
              return (
                <DesktopNavLink
                  key={link.href + link.id}
                  href={link.href}
                  $active={active}
                  onClick={() => onTabChange && onTabChange(link.id)}
                >
                  {link.label}
                </DesktopNavLink>
              );
            })}

            {user ? (
              <LogoutButton
                onClick={async () => {
                  await logout();
                  if (onTabChange) onTabChange('GUEST');
                }}
                data-testid="logout-btn"
              >
                <LogOut size={16} /> Logout
              </LogoutButton>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <DesktopNavLink href="/login" $active={pathname === '/login'}>
                  Log In
                </DesktopNavLink>
                <ActionButton href="/register">Sign Up</ActionButton>
              </div>
            )}
          </DesktopNav>

          {/* Mobile Hamburger Toggle */}
          <HamburgerButton
            onClick={toggleDrawer}
            aria-label="Toggle menu"
            data-testid="hamburger-menu"
          >
            {drawerOpen ? <X size={24} /> : <Menu size={24} />}
          </HamburgerButton>
        </Container>
      </HeaderWrapper>

      {/* Mobile Slide-Out Drawer */}
      <MobileDrawerOverlay $open={drawerOpen} onClick={closeDrawer} />
      <MobileDrawerContent $open={drawerOpen} data-testid="mobile-drawer">
        <DrawerHeader>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <LogoImage src="/logo.png" alt="Fade Finder Logo" style={{ width: 32, height: 32 }} />
            <span style={{ fontWeight: 800, fontSize: '1rem', color: '#f8fafc' }}>FADE FINDER</span>
          </div>
          <HamburgerButton onClick={closeDrawer}>
            <X size={20} />
          </HamburgerButton>
        </DrawerHeader>

        {user ? (
          <UserProfileSection>
            <UserName>
              {user.firstName} {user.lastName}
            </UserName>
            <UserEmail>{user.email}</UserEmail>
            <RoleBadge $role={role} style={{ marginTop: '0.4rem', display: 'inline-block' }}>
              {role} Account
            </RoleBadge>
          </UserProfileSection>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <ActionButton href="/login" onClick={closeDrawer} style={{ textAlign: 'center' }}>
              Log In
            </ActionButton>
            <ActionButton
              href="/register"
              onClick={closeDrawer}
              style={{
                textAlign: 'center',
                background: 'transparent',
                border: '1px solid #334155',
                color: '#f8fafc',
              }}
            >
              Sign Up
            </ActionButton>
          </div>
        )}

        <DrawerNavList>
          {navLinks.map((link) => {
            const active = isLinkActive(link.href, link.id);
            return (
              <DrawerNavLink
                key={link.href + link.id}
                href={link.href}
                $active={active}
                onClick={() => {
                  if (onTabChange) onTabChange(link.id);
                  closeDrawer();
                }}
              >
                <DrawerLinkContent>{link.label}</DrawerLinkContent>
                <ChevronRight size={16} />
              </DrawerNavLink>
            );
          })}
        </DrawerNavList>

        {user && (
          <LogoutButton
            onClick={async () => {
              closeDrawer();
              await logout();
              if (onTabChange) onTabChange('GUEST');
            }}
            style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}
          >
            <LogOut size={16} /> Log Out
          </LogoutButton>
        )}
      </MobileDrawerContent>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav data-testid="bottom-nav">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <BottomNavItem key={item.href} href={item.href} $active={active}>
              <Icon size={20} />
              <span>{item.label}</span>
            </BottomNavItem>
          );
        })}
      </MobileBottomNav>
    </>
  );
};

export default Navbar;
