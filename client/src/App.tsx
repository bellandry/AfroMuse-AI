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
import Contact from "./pages/Contact";
import Account from "./pages/Account";
import { SeoRouteHead } from "./components/SeoRouteHead";
import { SeoStructuredData } from "./components/SeoStructuredData";
import { ContentDetail, ContentHub } from "./pages/Content";
import { getContent } from "@shared/seo-content";
import Trust from "./pages/Trust";

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
      <Route path={"/contact"} component={Contact} />
      <Route path={"/compte"} component={Account} />
      <Route path={"/styles"}>{() => <ContentHub kind="style" />}</Route>
      <Route path={"/ambiances"}>{() => <ContentHub kind="mood" />}</Route>
      <Route path={"/guides"}>{() => <ContentHub kind="guide" />}</Route>
      <Route path={"/cas-usages"}>{() => <ContentHub kind="useCase" />}</Route>
      <Route path={"/styles/:slug"}>{({ slug }) => { const entry = getContent("style", slug); return entry ? <ContentDetail entry={entry} /> : <NotFound />; }}</Route>
      <Route path={"/ambiances/:slug"}>{({ slug }) => { const entry = getContent("mood", slug); return entry ? <ContentDetail entry={entry} /> : <NotFound />; }}</Route>
      <Route path={"/guides/:slug"}>{({ slug }) => { const entry = getContent("guide", slug); return entry ? <ContentDetail entry={entry} /> : <NotFound />; }}</Route>
      <Route path={"/cas-usages/:slug"}>{({ slug }) => { const entry = getContent("useCase", slug); return entry ? <ContentDetail entry={entry} /> : <NotFound />; }}</Route>
      <Route path={"/cgu"}>{() => <Legal type="cgu" />}</Route>
      <Route path={"/confidentialite"}>{() => <Legal type="confidentialite" />}</Route>
      <Route path={"/mentions-legales"}>{() => <Trust type="mentions" />}</Route>
      <Route path={"/politique-cookies"}>{() => <Trust type="cookies" />}</Route>
      <Route path={"/politique-contenu-ia"}>{() => <Trust type="ai" />}</Route>
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
          <SeoRouteHead />
          <SeoStructuredData />
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
