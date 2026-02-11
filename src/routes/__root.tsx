import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import React, { Suspense } from 'react';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { Button } from '../components/ui/button';
import { Calculator, BarChart2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const TanStackRouterDevtools =
  import.meta.env.PROD
    ? () => null // Render nothing in production
    : React.lazy(() =>
        // Lazy load in development
        import('@tanstack/router-devtools').then((res) => ({
          default: res.TanStackRouterDevtools,
        })),
      )

export const Route = createRootRoute({
  component: () => {
    const { t } = useTranslation();
    
    return (
      <>
        <div className="min-h-screen bg-[#0f111a] text-white selection:bg-[var(--asset-primary)] selection:text-black">
          <div className="mx-auto max-w-7xl px-4 py-12">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 rounded-xl bg-white/5 p-1">
                <Link
                  to="/"
                  activeProps={{ className: 'bg-white/10 text-white' }}
                  inactiveProps={{ className: 'text-slate-400' }}
                >
                  {({ isActive }) => (
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Calculator size={16} />
                      {t("comparison.nav_calculator")}
                    </Button>
                  )}
                </Link>
                <Link
                  to="/compare"
                  activeProps={{ className: 'bg-white/10 text-white' }}
                  inactiveProps={{ className: 'text-slate-400' }}
                >
                  {({ isActive }) => (
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <BarChart2 size={16} />
                      {t("comparison.nav_comparison")}
                    </Button>
                  )}
                </Link>
              </div>
              <LanguageSwitcher />
            </div>

            <Outlet />

            <footer className="mt-20 border-t border-white/5 pt-8 text-center text-sm text-slate-500">
              <p>
                {t("app.footer", {
                  year: new Date().getFullYear(),
                  asset: "Crypto/Gold/Silver",
                })}
              </p>
            </footer>
          </div>
        </div>
        <Suspense>
          <TanStackRouterDevtools />
        </Suspense>
      </>
    );
  },
});
