import * as React from 'react'
import { Menu } from 'lucide-react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Button } from '../ui/button'
import { cn } from '../../lib/utils'
import { useAuthStore } from '../../stores/auth-store'
import { Sidebar } from './sidebar'
import { TopNavbar } from './top-navbar'
import { ProfileModal } from '../profile/profile-modal'

const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
)

const ForumIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.993 1.993 0 01-1-1.75V5.25A1.993 1.993 0 019 4H5a2 2 0 00-2 2v6a2 2 0 001 2h2v4l.5-.5z" />
  </svg>
)

const ChatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
)

const defaultNavSections = [
  {
    title: 'Workspace',
    items: [
      { label: 'Home', href: '/', icon: <HomeIcon /> },
      { label: 'Forum', href: '/app/forum', icon: <ForumIcon /> },
      { label: 'Chat', href: '/app/chat', icon: <ChatIcon /> },
    ],
  },
]

export function AppLayout({ children, className }: { children?: React.ReactNode; className?: string }) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [showProfileModal, setShowProfileModal] = React.useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = React.useState(false)
  const navigate = useNavigate()
  
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className={cn('flex h-screen w-full bg-background', className)}>
      <div className="hidden lg:block h-full">
        <Sidebar
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
          navSections={defaultNavSections}
          className="h-full"
        />
      </div>

      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
            <Sidebar
              navSections={defaultNavSections}
              onCollapsedChange={() => {}}
              className="h-full"
            />
          </div>
        </>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNavbar>
          <Button
            onClick={() => setMobileMenuOpen(true)}
            type="button"
            variant="ghost"
            size="icon"
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <TopNavbar.Brand className="min-w-0">
            <div className="hidden min-w-0 lg:block">
              <p className="truncate text-sm font-semibold tracking-tight">Prasthanam Robotics</p>
              <p className="truncate text-xs text-muted-foreground">The Robotics Club of GBPIET</p>
            </div>
          </TopNavbar.Brand>

          <TopNavbar.Search placeholder="Search discussions" className="ml-auto" />

          <TopNavbar.Content>
            <div className="relative">
              <TopNavbar.User 
                name={user?.username || "Member"} 
                email={user?.email}
                avatar={user?.avatar}
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              />
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md bg-[#111] border border-[#333] shadow-lg py-1 z-50">
                  <button 
                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#222] font-semibold transition-colors" 
                    onClick={() => { setUserDropdownOpen(false); setShowProfileModal(true); }}
                  >
                    Edit Profile
                  </button>
                  <button 
                    className="w-full text-left px-4 py-2 text-sm text-neutral-400 hover:text-white hover:bg-[#222] font-semibold transition-colors" 
                    onClick={() => {
                      setUserDropdownOpen(false);
                      const users = [
                        { id: 1, name: 'Vaibhav Pokhriyal', username: 'prasthanam_lead', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80', bio: 'Club President & Lead @ Prasthanam.', email: 'lead@prasthanam.gbpiet.ac.in' },
                        { id: 2, name: 'Aditya Rawat', username: 'robowar_tech', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80', bio: 'Hardware & Combat Robotics Lead.', email: 'aditya@prasthanam.gbpiet.ac.in' },
                        { id: 3, name: 'Neha Negi', username: 'drone_embedded', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80', bio: 'Autonomous Systems & Drone Lead.', email: 'neha@prasthanam.gbpiet.ac.in' },
                        { id: 4, name: 'Siddharth Joshi', username: 'iot_automation', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80', bio: 'Embedded Firmware & IoT Lead.', email: 'siddharth@prasthanam.gbpiet.ac.in' },
                      ];
                      const nextUser = users.find(u => u.id !== user?.id) || users[0];
                      useAuthStore.getState().login(nextUser, 'mock-token');
                    }}
                  >
                    Switch Profile
                  </button>
                  <button 
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-[#222] font-semibold transition-colors" 
                    onClick={() => {
                      setUserDropdownOpen(false);
                      handleLogout();
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </TopNavbar.Content>
        </TopNavbar>

        <div className="flex flex-1 overflow-hidden">
          {children || <Outlet />}
        </div>
      </div>
      <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
    </div>
  )
}

export function AuthLayout({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "flex min-h-screen w-full items-center justify-center bg-black p-4 selection:bg-white selection:text-black font-sans",
        className
      )}
    >
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded bg-black border border-neutral-800 shadow-lg">
            <img src="/new-logo.png" alt="Prasthanam Logo" className="h-full w-full object-contain" />
          </div>
          <span className="text-xl font-black tracking-tighter font-ginto-nord text-white uppercase">Prasthanam</span>
        </div>
        {children}
      </div>
    </div>
  )
}
