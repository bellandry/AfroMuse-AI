import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import AppDashboard from "./pages/AppDashboard";
import Legal from "./pages/Legal";
import Studio from "./pages/Studio";
import Library from "./pages/Library";
import Credits from "./pages/Credits";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/connexion"} component={Auth} />
      <Route path={"/app"} component={AppDashboard} />
      <Route path={"/creer"} component={Studio} />
      <Route path={"/bibliotheque"} component={Library} />
      <Route path={"/credits"} component={Credits} />
      <Route path={"/cgu"}>{() => <Legal type="cgu" />}</Route>
      <Route path={"/confidentialite"}>{() => <Legal type="confidentialite" />}</Route>
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
