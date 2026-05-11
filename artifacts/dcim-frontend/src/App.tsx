import React from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Layout } from "@/components/layout";

// Pages
import Dashboard from "@/pages/dashboard";
import Sites from "@/pages/sites";
import Rooms from "@/pages/rooms";
import Racks from "@/pages/racks";
import RackView from "@/pages/rack-view";
import Assets from "@/pages/assets";
import Warranty from "@/pages/warranty";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/sites" component={Sites} />
        <Route path="/sites/:siteId/rooms" component={Rooms} />
        <Route path="/rooms/:roomId/racks" component={Racks} />
        <Route path="/racks/:rackId/view" component={RackView} />
        <Route path="/assets" component={Assets} />
        <Route path="/warranty" component={Warranty} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
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
