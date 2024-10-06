import { prismaClient } from "@/app/lib/db";
import { getDbUser, jsonResponse, messageResponse } from "@/app/utils";

export async function GET()
{
    const user = await getDbUser();
    if (!user)
        return messageResponse("Unauthenticated", 403);

    const mostUpvotedStream = await prismaClient.stream.findFirst({
        where: {
            userId: user.id,
            played: false
        },
        orderBy: {
            upvotes: {
                _count: 'desc'
            }
        }
    });

    await Promise.all([

        prismaClient.currentStream.upsert({
            where: {
                userId: user.id
            },
            update: {
                streamId: mostUpvotedStream?.id
            },
            create: {
                userId: user.id,
                streamId: mostUpvotedStream?.id
            }}), 

        prismaClient.stream.update({
            where: {
                id: mostUpvotedStream?.id
            },
            data: {
                played: true,
                playedTimestamp: new Date()
            }
        })
    ])

    return jsonResponse({
        stream: mostUpvotedStream
    }, 200);
}