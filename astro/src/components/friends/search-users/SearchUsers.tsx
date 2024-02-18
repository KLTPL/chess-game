import { useEffect, useRef, useState } from "react"
import { QueryClient, useMutation, useQuery } from "react-query";
import type { SearchGetResult } from "../../../pages/api/search-name-display-email/[alias].json";
import { acceptFriendInvite, deleteFriendConnection, deleteFriendInvite, fetchUsers, postFriendInvite } from "./fetch";
import UserCardsCollection from "./UserCardsCollection";
import type { GetDBAppUser } from "../../../db/types";

const queryClient = new QueryClient();

export default function SearchBar() {
  const searchbardRef = useRef<HTMLInputElement | null>(null);
  const [search, setSearch] = useState<string>("");

  const { data: searchData, status: searchDataStatus, refetch: searchDataRefetch } = useQuery<SearchGetResult | GetDBAppUser[]>({ 
    queryFn: async () => await fetchUsers(search),
    queryKey: ["search-users", {search}]
  });
  function isFriends(searchData: SearchGetResult | GetDBAppUser[], search: string): searchData is GetDBAppUser[] {
    return search.length === 0;
  }
  function invalidate() {
    queryClient.invalidateQueries(["search-users"]);
    searchDataRefetch();
  }
  const { mutate: mutatePostFriendInvite } = useMutation({
    mutationFn: async (userIdTo: string) => await postFriendInvite(userIdTo),
    onSuccess: invalidate,
  });
  const { mutate: mutateAcceptFriendInvite } = useMutation({
    mutationFn: async (userIdTo: string) => await acceptFriendInvite(userIdTo),
    onSuccess: invalidate,
  });
  const { mutate: mutateDeleteFriendInvite } = useMutation({
    mutationFn: async (userIdTo: string) => await deleteFriendInvite(userIdTo),
    onSuccess: invalidate,
  });
  const { mutate: mutateDeleteFriendConnection } = useMutation({
    mutationFn: async (userIdTo: string) => await deleteFriendConnection(userIdTo),
    onSuccess: invalidate,
  });
  useEffect(function () {
    searchDataRefetch();
  }, [search]);

  return <div className="flex flex-col w-full items-stretch overflow-x-hidden overflow-y-auto">
      <input 
        type="text" 
        placeholder="Wyszukaj po nazwie użytkownika, wyświetlanej nazwie użytkownika lub email" className="p-2 mx-10 rounded-md text-black text-center"
        onChange={(ev) => setSearch(ev.target.value)}
        ref={searchbardRef}
      />
      <div className="grow flex flex-col items-stretch self-center md:w-[70ch] mt-3 overflow-auto">
        {searchDataStatus === "loading" && <div className="grow text-xl text-white flex justify-center items-center">Ładowanie</div>}
        {searchDataStatus === "error" && <div className="grow text-xl text-red-700 flex justify-center items-center">Bład</div>}
        {searchDataStatus === "success" && (
          isFriends(searchData, search) ?
          <UserCardsCollection key="Znajomi" title="Znajomi" users={searchData} buttons={[{text: "Usuń", onClick: mutateDeleteFriendConnection}]} />
          : 
          <>
            <UserCardsCollection key="Znajomi" title="Znajomi" users={searchData.friends} buttons={[{text: "Usuń", onClick: mutateDeleteFriendConnection}]} />
            <UserCardsCollection key="Zaproszeni" title="Zaproszeni" users={searchData.invited} buttons={[{text: "Anuluj", onClick: mutateDeleteFriendInvite}]} />
            <UserCardsCollection key="Ci którzy Cię zaprosili" title="Ci którzy Cię zaprosili" users={searchData.whoInvited} buttons={[{text: "Akceptuj", onClick: mutateAcceptFriendInvite}, {text: "Odrzuć", onClick: mutateDeleteFriendInvite}]} />
            <UserCardsCollection key="Sugestie" title="Sugestie" users={searchData.suggestions} buttons={[{text: "Zaproś", onClick: mutatePostFriendInvite}]} />
            <UserCardsCollection key="Zablokowani" title="Zablokowani" users={searchData.blocked} buttons={[]} />
          </>
        )}
      </div>
  </div>
}