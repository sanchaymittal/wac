import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppKitProvider } from "@/context/AppKitProvider";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Bots from "./pages/Bots";
import Actions from "./pages/Actions";
import PlayToEarn from "./pages/PlayToEarn";
import NotFound from "./pages/NotFound";

const App = () => (
  <AppKitProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/bots" element={<Bots />} />
          <Route path="/actions" element={<Actions />} />
          <Route path="/play-to-earn" element={<PlayToEarn />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </AppKitProvider>
);

export default App;
