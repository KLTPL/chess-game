import { QueryClient, QueryClientProvider } from "react-query";
import SearchUsers, { type SearchUsersProps } from "./search-users/SearchUsers";

const queryClient = new QueryClient();

export default function Container({
  langDictFriends,
  langDictGameInviteCreate,
}: SearchUsersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <SearchUsers
        langDictFriends={langDictFriends}
        langDictGameInviteCreate={langDictGameInviteCreate}
      />
    </QueryClientProvider>
  );
}
