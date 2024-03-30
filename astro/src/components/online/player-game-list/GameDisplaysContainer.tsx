import { QueryClient, QueryClientProvider } from "react-query";
import OlderGameDisplays, { type OlderGameDisplaysProps } from "./GameDisplays";

const queryClient = new QueryClient();

export default function GameDisplaysContainer({
  incrementBy,
  playerId,
  startIdx,
  initGamesData,
  loadMoreOnScroll,
}: OlderGameDisplaysProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <OlderGameDisplays
        incrementBy={incrementBy}
        playerId={playerId}
        startIdx={startIdx}
        initGamesData={initGamesData}
        loadMoreOnScroll={loadMoreOnScroll}
      />
    </QueryClientProvider>
  );
}
