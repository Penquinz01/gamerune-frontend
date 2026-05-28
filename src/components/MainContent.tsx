import { useState } from "react";
import GameCard from "./GameCard";

function MainContent() {
  const games = ["GTA V", "Minecraft", "Elden Ring", "Valorant"];
  const [expandedGame, setExpandedGame] = useState<string | null>(null);

  return (
    <main className="grid flex-1 auto-rows-min grid-cols-2 gap-3 p-4 sm:grid-cols-3 sm:gap-4 sm:p-6 lg:grid-cols-5">
      {games.map((game) => (
        <GameCard
          key={game}
          title={game}
          isExpanded={expandedGame === game}
          onClick={() =>
            setExpandedGame((currentGame) =>
              currentGame === game ? null : game,
            )
          }
        />
      ))}
    </main>
  );
}

export default MainContent;
