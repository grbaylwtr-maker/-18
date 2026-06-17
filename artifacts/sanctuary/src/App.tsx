import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { Atrium } from "./pages/Atrium";
import { Echo } from "./pages/Echo";
import { Galaxy } from "./pages/Galaxy";
import { GalaxyDetail } from "./pages/GalaxyDetail";
import { Mirrors } from "./pages/Mirrors";
import { Music } from "./pages/Music";
import { Tales } from "./pages/Tales";
import { Mystery } from "./pages/Mystery";
import { Freedom } from "./pages/Freedom";
import { Kindred } from "./pages/Kindred";
import { Simplicity } from "./pages/Simplicity";
import { Complexity } from "./pages/Complexity";
import { Expression } from "./pages/Expression";
import { Sanctuary } from "./pages/Sanctuary";
import { Search } from "./pages/Search";
import { MoodJournal } from "./pages/MoodJournal";
import { MyCosmos } from "./pages/MyCosmos";
import NotFound from "@/pages/not-found";

import { CosmicNav } from "./components/CosmicNav";
import { RitualModal } from "./components/RitualModal";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <div className="flex min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-white">
      <RitualModal />
      <CosmicNav />
      <main className="flex-1 w-full pb-20 md:pb-0 md:pr-14 overflow-x-hidden relative">
        <Switch>
          <Route path="/" component={Atrium} />
          <Route path="/echo" component={Echo} />
          <Route path="/galaxy" component={Galaxy} />
          <Route path="/galaxy/:id" component={GalaxyDetail} />
          <Route path="/mirrors" component={Mirrors} />
          <Route path="/music" component={Music} />
          <Route path="/tales" component={Tales} />
          <Route path="/mystery" component={Mystery} />
          <Route path="/freedom" component={Freedom} />
          <Route path="/kindred" component={Kindred} />
          <Route path="/simplicity" component={Simplicity} />
          <Route path="/complexity" component={Complexity} />
          <Route path="/expression" component={Expression} />
          <Route path="/sanctuary" component={Sanctuary} />
          <Route path="/search" component={Search} />
          <Route path="/mood" component={MoodJournal} />
          <Route path="/cosmos" component={MyCosmos} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.dir = "rtl";
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
