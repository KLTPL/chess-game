import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import SearchBar from "./search-users/SearchUsers";

const queryClient = new QueryClient();

export default function Container() {
  
  return <QueryClientProvider client={queryClient}>
      <SearchBar />
  </QueryClientProvider>
}