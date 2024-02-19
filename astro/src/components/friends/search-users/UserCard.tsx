import type { UseMutateFunction } from "react-query";
import type { GetDBAppUser } from "../../../db/types"

export type ButtonInfo = {
  onClick: UseMutateFunction<void, unknown, string, unknown>;
  text: string;
};

type FriendCardProps = {
  user: GetDBAppUser;
  buttons: ButtonInfo[];
}

export default function UserCard({ user, buttons }: FriendCardProps) {
  return <div className="flex flex-row justify-stretch items-center bg-bg3 text-black p-2 rounded-md shadow-black shadow-sm">
      {user.name === user.display_name ?
        <div className="w-1/2 text-center font-bold">{user.name}</div> :
        <div className="w-1/2 flex flex-row">
          <div className="w-1/2 text-center font-bold">{user.name}</div>
          <div className="w-1/2 text-center">{user.display_name}</div>
        </div>
      }
    <div className="w-1/2 flex flex-row justify-end me-5 gap-1">
      {buttons.map(({text, onClick}) => (
        <button 
          key={text}
          className="bg-primary hover:bg-primary-d px-4 py-2 rounded-md text-white"
          onClick={() => onClick(user.id)}
        >
          {text}
        </button>
      ))}
      <button 
        className="bg-secondary hover:bg-secondary-d px-4 py-2 rounded-md text-white"
      >
        Wyzwij
      </button>
    </div>
  </div>
}