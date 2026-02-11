import { StrictMode, Suspense } from "react";
// ... existing imports ...

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <Suspense fallback={<div className="min-h-screen bg-[#0f111a] flex items-center justify-center text-white">Loading...</div>}>
        <RouterProvider router={router} />
      </Suspense>
    </HelmetProvider>
  </StrictMode>,
);
