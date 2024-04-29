import { useEffect, useRef, useState } from "react";
import { QueryClient, useMutation, useQuery } from "react-query";
import {
  acceptFriendInvite,
  deleteFriendConnection,
  deleteFriendInvite,
  fetchUsers,
  postFriendInvite,
} from "./fetch";
import type {
  APIRespGetRelatedUsers,
  APIRespGetSearchAlias,
} from "../../../db/types";
import UserCardsCollection from "./UserCardsCollection";

export type SearchUsersProps = {
  langDictFriends: Record<string, string>;
  langDictGameInviteCreate: Record<string, string>;
};

const queryClient = new QueryClient();

export default function SearchUsers({
  langDictFriends,
  langDictGameInviteCreate,
}: SearchUsersProps) {
  const searchbardRef = useRef<HTMLInputElement | null>(null);
  const [search, setSearch] = useState<string>("");

  const {
    data: searchData,
    status: searchDataStatus,
    refetch: searchDataRefetch,
  } = useQuery<APIRespGetSearchAlias | APIRespGetRelatedUsers>({
    queryFn: async () => await fetchUsers(search),
    queryKey: ["search-users", { search }],
  });
  function isDataSearchResult(
    searchData: APIRespGetSearchAlias | APIRespGetRelatedUsers
  ): searchData is APIRespGetSearchAlias {
    return searchData.type === "APIRespGetSearchAlias";
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
        placeholder="Wyszukaj po nazwie lub wyświetlanej nazwie"
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
          (!isDataSearchResult(searchData) ? (
            <>
              <UserCardsCollection
                key="1-friends"
                title={langDictFriends["card_header-friends"]}
                users={searchData.friends}
                buttons={[
                  {
                    text: langDictFriends["card_button-delete"],
                    onClick: mutateDeleteFriendConnection,
                  },
                ]}
                isGameInviteButton={true}
                langDictGameInviteCreate={langDictGameInviteCreate}
              />
              <UserCardsCollection
                key="1-invited"
                title={langDictFriends["card_header-invited"]}
                users={searchData.invited}
                buttons={[
                  {
                    text: langDictFriends["card_button-cancel"],
                    onClick: mutateDeleteFriendInvite,
                  },
                ]}
                langDictGameInviteCreate={langDictGameInviteCreate}
              />
              <UserCardsCollection
                key="1-whoInvited"
                title={langDictFriends["card_header-who_invited"]}
                users={searchData.whoInvited}
                buttons={[
                  {
                    text: langDictFriends["card_button-accept"],
                    onClick: mutateAcceptFriendInvite,
                  },
                  {
                    text: langDictFriends["card_button-reject"],
                    onClick: mutateDeleteFriendInvite,
                  },
                ]}
                langDictGameInviteCreate={langDictGameInviteCreate}
              />
              <UserCardsCollection
                key="1-blocked"
                title={langDictFriends["card_header-blocked"]}
                users={searchData.blocked}
                buttons={[]}
                langDictGameInviteCreate={langDictGameInviteCreate}
              />
            </>
          ) : (
            <>
              <UserCardsCollection
                key="2-friends"
                title={langDictFriends["card_header-friends"]}
                users={searchData.friends}
                buttons={[
                  {
                    text: langDictFriends["card_button-delete"],
                    onClick: mutateDeleteFriendConnection,
                  },
                ]}
                isGameInviteButton={true}
                langDictGameInviteCreate={langDictGameInviteCreate}
              />
              <UserCardsCollection
                key="2-invited"
                title={langDictFriends["card_header-invited"]}
                users={searchData.invited}
                buttons={[
                  {
                    text: langDictFriends["card_button-cancel"],
                    onClick: mutateDeleteFriendInvite,
                  },
                ]}
                langDictGameInviteCreate={langDictGameInviteCreate}
              />
              <UserCardsCollection
                key="2-whoInvited"
                title={langDictFriends["card_header-who_invited"]}
                users={searchData.whoInvited}
                buttons={[
                  {
                    text: langDictFriends["card_button-accept"],
                    onClick: mutateAcceptFriendInvite,
                  },
                  {
                    text: langDictFriends["card_button-reject"],
                    onClick: mutateDeleteFriendInvite,
                  },
                ]}
                langDictGameInviteCreate={langDictGameInviteCreate}
              />
              <UserCardsCollection
                key="2-suggestions"
                title={langDictFriends["card_header-suggestions"]}
                users={searchData.suggestions}
                buttons={[
                  {
                    text: langDictFriends["card_button-invite"],
                    onClick: mutatePostFriendInvite,
                  },
                ]}
                langDictGameInviteCreate={langDictGameInviteCreate}
              />
            </>
          ))}
      </div>
    </div>
  );
}
