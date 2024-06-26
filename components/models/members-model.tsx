"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import qs from "query-string";
import { useModal } from "@/hooks/use-model-store";
import { ServerWithMembersWithProfiles } from "@/types/types";
import { ScrollArea } from "../ui/scroll-area";
import { UserAvatar } from "../user-avatar";
import {
  Check,
  Gavel,
  Loader2,
  MoreVertical,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldIcon,
  ShieldQuestion,
} from "lucide-react";
import { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import axios from "axios";
import { useRouter } from "next/navigation";

type MemberRole = "GUEST" | "MODERATOR" | "ADMIN" | "USER"; // Add 'USER' if that's a possible role
const roleIcon: Record<MemberRole, JSX.Element | null> = {
  GUEST: null,
  MODERATOR: <ShieldCheck className=" h-4 w-4 ml-2 text-indigo-500" />,
  ADMIN: <ShieldAlert className=" h-4 w-4 text-rose-400" />,
  USER: <ShieldIcon className=" h-4 w-4 ml-2 text-green-400" />, // Example icon for USER role
};

export const MembersModel = () => {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState("");
  const { isOpen, onClose, onOpen, type, data } = useModal();

  const { server } = data as unknown as {
    server: ServerWithMembersWithProfiles;
  };

  const isModalOpen = isOpen && type === "members";

  const onKick = async (memberId: string) => {
    try {
      const url = qs.stringifyUrl({
        url: `/api/members/${memberId}`,
        query: { serverId: server?.id },
      });
      const res = await axios.delete(url);
      router.refresh();
      onOpen("members", { server: res.data, query: {} }); // Include query property
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingId("");
    }
  };

  const onRoleChange = async (memberId: string, role: MemberRole) => {
    try {
      setLoadingId(memberId);
      const url = qs.stringifyUrl({
        url: `/api/members/${memberId}`,
        query: { serverId: server?.id },
      });

      const res = await axios.patch(url, { role });
      router.refresh();
      onOpen("members", { server: res.data, query: {} }); // Include query property
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingId("");
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className=" bg-white overflow-hidden text-black">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className=" text-center font-semibold">
            Manage Members
          </DialogTitle>

          <DialogDescription className="text-center text-zinc-500">
            {server?.members?.length} members
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="mt-8 max-h-[420px] pr-6">
          {server && server.members && server.members.length > 0 ? (
            server.members.map((member) => (
              <div key={member.id} className="flex items-center gap-x-2 mb-6">
                <UserAvatar src={member.profile.imageUrl} />
                <div className="flex flex-col gap-y-1">
                  <div className="text-xs flex font-semibold items-center gap-x-1">
                    {member.profile.name}
                    {roleIcon[member.role as MemberRole]}
                  </div>
                  <p className="text-xs text-zinc-500">
                    {member.profile.email}
                  </p>
                </div>
                {server.profileId !== member.profileId &&
                  loadingId !== member.id && (
                    <div>
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <MoreVertical className="h-4 w-4 text-zinc-500" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="left">
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger className="flex items-center">
                              <ShieldQuestion className="w-4 h-4 mr-2" />
                              <span>Role</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                              <DropdownMenuSubContent>
                                <DropdownMenuItem
                                  onClick={() => {
                                    onRoleChange(member.id, "GUEST");
                                  }}
                                >
                                  <Shield className="h-4 w-4 mr-2" />
                                  Guest
                                  {member.role === "USER" && (
                                    <Check className="h-4 w-4 ml-auto" />
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    onRoleChange(member.id, "MODERATOR");
                                  }}
                                >
                                  <ShieldCheck className="h-4 w-4 mr-2" />
                                  Moderator
                                  {member.role === "MODERATOR" && (
                                    <Check className="h-4 w-4 ml-auto" />
                                  )}
                                </DropdownMenuItem>
                              </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                          </DropdownMenuSub>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onKick(member.id)}>
                            <Gavel className="h-4 w-4 mr-2" />
                            Kick
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                {loadingId === member.id && (
                  <Loader2 className="animate-spin text-zinc-500 ml-auto w-4 h-4" />
                )}
              </div>
            ))
          ) : (
            <p>No members available.</p>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
