import { prismaClient } from "@/app/lib/db";
import { getDbUser, messageResponse } from "@/app/utils";
import { NextRequest } from "next/server";
import { z } from "zod";

const UpvoteSchema = z.object({
    streamId: z.string()
})

export async function POST(req: NextRequest)
{
    try
    {
        const user = await getDbUser();

        if(!user)
            return messageResponse("Unauthenticated", 403);

        const data = UpvoteSchema.parse(await req.json())

        await prismaClient.upvote.create({
            data: {
                userId: user.id,
                streamId: data.streamId
            }
        })

        return messageResponse("Upvote successfully registered", 200);

    } catch (error)
    {
        return messageResponse(`Error while upvoting ${error}`, 400);
    }
}

export async function DELETE(req: NextRequest)
{
    try
    {
        const user = await getDbUser();

        if (!user)
            return messageResponse("Unauthenticated", 403);

        const streamId : string = req.nextUrl.searchParams.get("streamId") ?? "";

        await prismaClient.upvote.delete({
            where: {
                userId_streamId: {
                    userId: user.id,
                    streamId: streamId
                }
            }
        })

        return messageResponse("Upvote successfully deleted", 200);

    } catch (error)
    {
        return messageResponse(`Error while deleting the upvote ${error}`, 400);
    }

}