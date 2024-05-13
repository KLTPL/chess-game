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
  function isSearchTheSame(search: string) {
    return searchbardRef.current?.value === search;
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
        onChange={(ev) => {
          const currVal = ev.target.value;
          if (currVal.length < 2) {
            setSearch(currVal);
          } else {
            setTimeout(() => {
              if (isSearchTheSame(currVal)) {
                setSearch(currVal);
              }
            }, 200);
          }
        }}
        ref={searchbardRef}
        spellCheck={false}
      />
      <div className="my-3 flex w-[97vw] grow flex-col items-stretch self-center overflow-auto md:w-[70ch]">
        {searchDataStatus === "loading" && (
          <div
            className="mt-3 flex grow items-center justify-center overflow-hidden text-lg text-white"
            title="loading"
          >
            <div className="animate-spin">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
                fill="currentColor"
                className="bi bi-arrow-clockwise"
                viewBox="0 0 16 16"
              >
                <path
                  fillRule="evenodd"
                  d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z"
                />
                <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466" />
              </svg>
            </div>
          </div>
        )}
        {searchDataStatus === "error" && (
          <div
            className="mt-3 flex grow items-center justify-center text-lg text-red-700"
            title="error"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              fill="currentColor"
              className="bi bi-x-circle"
              viewBox="0 0 16 16"
            >
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
            </svg>
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
                    isSecondary: true,
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
                    isSecondary: true,
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
