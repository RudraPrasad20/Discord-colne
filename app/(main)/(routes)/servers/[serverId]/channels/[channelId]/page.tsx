// import ChatHeader from "@/components/chat/chat-header";
// import ChatInput from "@/components/chat/chat-input";
// import ChatMessages from "@/components/chat/chat-messages";
// import { MediaRoom } from "@/components/media-room";
// import { currentProfile } from "@/lib/current-profile";
import ChatHeader from "@/components/chat/chat-header";
import { CurrentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { RedirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

interface ChannelIdPageProps {
  params: {
    serverId: string;
    channelId: string;
  };
}

const ChannelIdPage = async ({ params }: ChannelIdPageProps) => {
  const profile = await CurrentProfile();

  if (!profile) {
    return <RedirectToSignIn />;
  }

  const channel = await db.channel.findUnique({
    where: {
      id: params.channelId,
    },
  });

  const member = await db.member.findFirst({
    where: {
      serverId: params.serverId,
      profileId: profile.id,
    },
  });

  if (!channel || !member) {
    redirect("/");
  }

  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col h-screen">
      <ChatHeader
        name={channel.name}
        serverId={channel.serverId}
        type="channel"
      />
  
    </div>
  );
};

export default ChannelIdPage;