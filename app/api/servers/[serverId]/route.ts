import { CurrentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, 
    {params}: {params: {serverId: string}}
) {
    try {
        const profile = await CurrentProfile()
        const { name, imageUrl } = await req.json()

        if(!profile){
            return new NextResponse("Unauthorized", {status: 401})
        }
        
        const server = await db.server.update({
            where: {
                id: params.serverId,
                profileId: profile.id
            },
            data: {
                name,
                imageUrl
            }
        })
        return NextResponse.json(server)
    } catch (error) {
        console.log("serverpath errror")
        return new NextResponse("internal error", {status: 500})
    }
    
}