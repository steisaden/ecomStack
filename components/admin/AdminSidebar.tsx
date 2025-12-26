'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    ShoppingBag,
    Share2,
    FileText,
    Calendar,
    Clock,
    Settings,
    Menu,
    X,
    Instagram,
    Sparkles,
    Info,
    LogOut,
    ChevronRight,
    Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarItem {
    name: string;
    href: string;
    icon: React.ElementType;
}

const sidebarItems: SidebarItem[] = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: ShoppingBag },
    { name: 'Affiliate', href: '/admin/affiliate-products', icon: Share2 },
    { name: 'Blog Posts', href: '/admin/blog-posts', icon: FileText },
    { name: 'Yoga Services', href: '/admin/yoga-services', icon: Calendar },
    { name: 'Availability', href: '/admin/yoga-availability', icon: Clock },
    { name: 'Social Media', href: '/admin/social-media', icon: Instagram },
    { name: 'About Page', href: '/admin/about-page', icon: Info },
    { name: 'AI Rules', href: '/admin/ai-rules', icon: Sparkles },
    { name: 'Amazon Config', href: '/admin/amazon-paapi-config', icon: Database },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Handle mobile detection
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
            if (window.innerWidth >= 1024) {
                setIsOpen(true);
            } else {
                setIsOpen(false);
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Close mobile sidebar on navigation
    useEffect(() => {
        if (isMobile) {
            setIsOpen(false);
        }
    }, [pathname, isMobile]);

    const toggleSidebar = () => setIsOpen(!isOpen);

    return (
        <>
            {/* Mobile Toggle Button */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleSidebar}
                    className="bg-surface border-border-muted text-text-strong shadow-sm"
                >
                    {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
            </div>

            {/* Overlay for mobile */}
            <AnimatePresence>
                {isMobile && isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        // @ts-ignore - framer motion types conflict
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar Container */}
            <motion.aside
                className={cn(
                    "fixed top-0 left-0 z-40 h-screen bg-panel border-r border-border-muted transition-all duration-300 ease-in-out",
                    "lg:translate-x-0 w-72"
                )}
                initial={false}
                animate={{
                    translateX: isOpen || !isMobile ? 0 : '-100%'
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-6 pb-2">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center text-white font-bold text-sm">
                                G
                            </div>
                            <h1 className="text-sm font-semibold text-text-strong uppercase tracking-wider">
                                Goddess Admin
                            </h1>
                        </div>
                    </div>

                    <div className="px-6 py-2">
                        <div className="h-px bg-border-muted" />
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-1">
                        {sidebarItems.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;

                            return (
                                <Link key={item.href} href={item.href}>
                                    <div className={cn(
                                        "group flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 text-sm font-medium",
                                        isActive
                                            ? "bg-surface-alt text-text-strong shadow-sm ring-1 ring-border-muted"
                                            : "text-text-muted hover:bg-surface-alt hover:text-text-strong"
                                    )}>
                                        <Icon className={cn(
                                            "h-4 w-4 transition-colors",
                                            isActive ? "text-primary" : "text-text-muted group-hover:text-primary"
                                        )} />
                                        <span>{item.name}</span>
                                        {isActive && (
                                            <motion.div layoutId="active-pill" className="ml-auto w-1 h-1 rounded-full bg-primary" />
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer / User Profile */}
                    <div className="p-4 border-t border-border-muted bg-surface/50">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-surface-alt border border-border-muted flex items-center justify-center text-primary font-bold text-xs">
                                A
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-text-strong truncate">Admin User</p>
                                <p className="text-xs text-text-muted truncate">goddess@admin.com</p>
                            </div>
                            <form action="/api/auth/logout" method="POST">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-text-muted hover:text-red-500 hover:bg-red-50/50">
                                    <LogOut className="h-4 w-4" />
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </motion.aside>
        </>
    );
}
