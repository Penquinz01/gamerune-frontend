import "./App.css";
import { useState } from "react";
import Header from "./components/Header";
import MainContent from "./components/MainContent";
import Sidebar from "./components/SideBar";
import AuthDialog from "./components/AuthDialog";
import WishlistView from "./components/WishlistView";
import { AuthProvider } from "./lib/authContext";

export type View = "browse" | "wishlist";

function App() {
  const [view, setView] = useState<View>("browse");
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <AuthProvider>
      <div className="app-shell min-h-screen text-[var(--text)]">
        <Header
          view={view}
          onViewChange={setView}
          onAuthClick={() => setAuthOpen(true)}
        />
        <div className="flex min-w-0 flex-col md:flex-row">
          <Sidebar view={view} onViewChange={setView} />
          {view === "browse" ? (
            <MainContent onRequireAuth={() => setAuthOpen(true)} />
          ) : (
            <WishlistView onRequireAuth={() => setAuthOpen(true)} />
          )}
        </div>
        <AuthDialog open={authOpen} onClose={() => setAuthOpen(false)} />
      </div>
    </AuthProvider>
  );
}

export default App;
