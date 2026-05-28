import "./App.css";
import Header from "./components/Header";
import MainContent from "./components/MainContent";
import Sidebar from "./components/SideBar";

function App() {
  return (
    <div className="app-shell min-h-screen text-[var(--text)]">
      <Header />
      <div className="flex min-w-0 flex-col md:flex-row">
        <Sidebar />
        <MainContent />
      </div>
    </div>
  );
}

export default App;
