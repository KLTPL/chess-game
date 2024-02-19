import { useEffect, useRef, useState } from "react";
import { QueryClient, useMutation, useQuery } from "react-query";
import type { SearchGetResult } from "../../../pages/api/search-name-display-email/[alias].json";
import {
  acceptFriendInvite,
  deleteFriendConnection,
  deleteFriendInvite,
  fetchUsers,
  postFriendInvite,
} from "./fetch";
import UserCardsCollection from "./UserCardsCollection";
import type { GetDBAppUser } from "../../../db/types";

const queryClient = new QueryClient();

export default function SearchBar() {
  const searchbardRef = useRef<HTMLInputElement | null>(null);
  const [search, setSearch] = useState<string>("");

  const {
    data: searchData,
    status: searchDataStatus,
    refetch: searchDataRefetch,
  } = useQuery<SearchGetResult | GetDBAppUser[]>({
    queryFn: async () => await fetchUsers(search),
    queryKey: ["search-users", { search }],
  });
  function isFriends(
    searchData: SearchGetResult | GetDBAppUser[],
    search: string
  ): searchData is GetDBAppUser[] {
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
    mutationFn: async (userIdTo: string) =>
      await deleteFriendConnection(userIdTo),
    onSuccess: invalidate,
  });
  useEffect(
    function () {
      searchDataRefetch();
    },
    [search]
  );

  return (
    <div className="flex w-full flex-col items-stretch overflow-y-auto overflow-x-hidden">
      <input
        type="text"
        placeholder="Wyszukaj po nazwie użytkownika, wyświetlanej nazwie użytkownika lub email"
        className="mx-10 rounded-md p-2 text-center text-black"
        onChange={(ev) => setSearch(ev.target.value)}
        ref={searchbardRef}
        spellCheck={false}
      />
      <div className="my-3 flex grow flex-col items-stretch self-center overflow-auto md:w-[70ch]">
        {searchDataStatus === "loading" && (
          <div className="flex grow items-center justify-center text-xl text-white">
            Ładowanie
          </div>
        )}
        {searchDataStatus === "error" && (
          <div className="flex grow items-center justify-center text-xl text-red-700">
            Bład
          </div>
        )}
        {searchDataStatus === "success" &&
          (isFriends(searchData, search) ? (
            <UserCardsCollection
              key="Znajomi"
              title="Znajomi"
              users={searchData}
              buttons={[
                { text: "Usuń", onClick: mutateDeleteFriendConnection },
              ]}
            />
          ) : (
            <>
              <UserCardsCollection
                key="Znajomi"
                title="Znajomi"
                users={searchData.friends}
                buttons={[
                  { text: "Usuń", onClick: mutateDeleteFriendConnection },
                ]}
              />
              <UserCardsCollection
                key="Zaproszeni"
                title="Zaproszeni"
                users={searchData.invited}
                buttons={[
                  { text: "Anuluj", onClick: mutateDeleteFriendInvite },
                ]}
              />
              <UserCardsCollection
                key="Ci którzy Cię zaprosili"
                title="Ci którzy Cię zaprosili"
                users={searchData.whoInvited}
                buttons={[
                  { text: "Akceptuj", onClick: mutateAcceptFriendInvite },
                  { text: "Odrzuć", onClick: mutateDeleteFriendInvite },
                ]}
              />
              <UserCardsCollection
                key="Sugestie"
                title="Sugestie"
                users={searchData.suggestions}
                buttons={[{ text: "Zaproś", onClick: mutatePostFriendInvite }]}
              />
              <UserCardsCollection
                key="Zablokowani"
                title="Zablokowani"
                users={searchData.blocked}
                buttons={[]}
              />
            </>
          ))}
      </div>
    </div>
  );
}
