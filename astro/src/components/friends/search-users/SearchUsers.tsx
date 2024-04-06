import { useEffect, useRef, useState } from "react";
import { QueryClient, useMutation, useQuery } from "react-query";
import {
  acceptFriendInvite,
  deleteFriendConnection,
  deleteFriendInvite,
  fetchUsers,
  postFriendInvite,
} from "./fetch";
import UserCardsCollection from "./UserCardsCollection";
import type {
  GetResultRelatedUsers,
  GetResultSearchNameDisplayEmail,
} from "../../../db/types";

const queryClient = new QueryClient();

export default function SearchBar() {
  const searchbardRef = useRef<HTMLInputElement | null>(null);
  const [search, setSearch] = useState<string>("");

  const {
    data: searchData,
    status: searchDataStatus,
    refetch: searchDataRefetch,
  } = useQuery<GetResultSearchNameDisplayEmail | GetResultRelatedUsers>({
    queryFn: async () => await fetchUsers(search),
    queryKey: ["search-users", { search }],
  });
  function isDataSearchResult(
    searchData: GetResultSearchNameDisplayEmail | GetResultRelatedUsers,
    search: string
  ): searchData is GetResultSearchNameDisplayEmail {
    return search.length > 1;
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
  useEffect(function () {
    const searchText = "search=";
    const idxS = window.location.hash.indexOf(searchText);
    const idxE = window.location.hash.indexOf(";");
    if (idxS !== -1 && idxE !== -1) {
      const userAlias = window.location.hash.slice(
        idxS + searchText.length,
        idxE
      );
      if (userAlias.length > 0 && search !== userAlias) {
        setSearch(userAlias);
        if (searchbardRef.current !== null) {
          searchbardRef.current.value = userAlias;
        }
      }
    }
  }, []);
  useEffect(
    function () {
      if (search.length > 0) {
        window.location.hash = `#search=${search};`;
      } else {
        window.location.hash = "";
      }
    },
    [search]
  );

  return (
    <div className="flex w-full flex-col items-stretch overflow-y-auto overflow-x-hidden">
      <input
        type="text"
        placeholder="Wyszukaj po nazwie, wyświetlanej nazwie lub email"
        className="w-[97vw] rounded-md p-2 text-center text-black shadow-lg"
        onChange={(ev) => setSearch(ev.target.value)}
        ref={searchbardRef}
        spellCheck={false}
      />
      <div className="my-3 flex w-[97vw] grow flex-col items-stretch self-center overflow-auto md:w-[70ch]">
        {searchDataStatus === "loading" && (
          <div className="flex grow items-center justify-center text-lg text-white">
            Ładowanie
          </div>
        )}
        {searchDataStatus === "error" && (
          <div className="flex grow items-center justify-center text-lg text-red-700">
            Bład
          </div>
        )}
        {searchDataStatus === "success" &&
          (!isDataSearchResult(searchData, search) ? (
            <>
              <UserCardsCollection
                key="1-friends"
                title="Znajomi"
                users={searchData.friends}
                buttons={[
                  { text: "Usuń", onClick: mutateDeleteFriendConnection },
                ]}
                isGameInviteButton={true}
              />
              <UserCardsCollection
                key="1-invited"
                title="Zaproszeni"
                users={searchData.invited}
                buttons={[
                  { text: "Anuluj", onClick: mutateDeleteFriendInvite },
                ]}
              />
              <UserCardsCollection
                key="1-whoInvited"
                title="Ci którzy Cię zaprosili"
                users={searchData.whoInvited}
                buttons={[
                  { text: "Akceptuj", onClick: mutateAcceptFriendInvite },
                  { text: "Odrzuć", onClick: mutateDeleteFriendInvite },
                ]}
              />
              <UserCardsCollection
                key="1-blocked"
                title="Zablokowani"
                users={searchData.blocked}
                buttons={[]}
              />
            </>
          ) : (
            <>
              <UserCardsCollection
                key="2-friends"
                title="Znajomi"
                users={searchData.friends}
                buttons={[
                  { text: "Usuń", onClick: mutateDeleteFriendConnection },
                ]}
                isGameInviteButton={true}
              />
              <UserCardsCollection
                key="2-invited"
                title="Zaproszeni"
                users={searchData.invited}
                buttons={[
                  { text: "Anuluj", onClick: mutateDeleteFriendInvite },
                ]}
              />
              <UserCardsCollection
                key="2-whoInvited"
                title="Ci którzy Cię zaprosili"
                users={searchData.whoInvited}
                buttons={[
                  { text: "Akceptuj", onClick: mutateAcceptFriendInvite },
                  { text: "Odrzuć", onClick: mutateDeleteFriendInvite },
                ]}
              />
              <UserCardsCollection
                key="2-suggestions"
                title="Sugestie"
                users={searchData.suggestions}
                buttons={[{ text: "Zaproś", onClick: mutatePostFriendInvite }]}
              />
              <UserCardsCollection
                key="2-blocked"
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
