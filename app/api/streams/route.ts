import { prismaClient } from "@/app/lib/db";
import { getDbUser, jsonResponse, messageResponse } from "@/app/utils";
import { NextRequest } from "next/server";

import youtubesearchapi from "youtube-search-api"
import { z } from "zod";

const YT_REGEX = /(?:(?:https?:)?\/\/)?(?:www\.)?(?:m\.)?(?:youtu(?:be)?\.com\/(?:v\/|embed\/|watch(?:\/|\?v=))|youtu\.be\/)((?:\w|-){11})(?:\S+)?$/;

const CreateStreamSchema = z.object({
    creatorId: z.string(),
    url: z.string()
})

export async function POST(req: NextRequest)
{
    try
    {
        const data = CreateStreamSchema.parse(await req.json());
        const isYt = data.url.match(YT_REGEX);

        const user = await getDbUser();
        
        if(!user)
            return messageResponse("Unauthenticated", 401);

        if (!isYt)
            return messageResponse("Wrong url format", 400);

        const extractedId = data.url.split("?v=")[1];
        const videoDetails = await youtubesearchapi.GetVideoDetails(extractedId);
        const thumbnails = videoDetails.thumbnail.thumbnails;
        thumbnails.sort((a: { width: number }, b: { width: number }) => a.width < b.width ? -1 : 1);
        const stream = await prismaClient.stream.create({
            data: {
                userId: data.creatorId ?? "",
                addedById: user.id,
                url: data.url ?? "",
                extractedId: extractedId,
                title: videoDetails.title ?? "Unable to find title",
                type: "Youtube",
                smallImg: thumbnails[0].url ?? "data:image/png;base64,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",
                bigImg: thumbnails[thumbnails.length - 1].url ?? "data:image/png;base64,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"
            }
        })

        return jsonResponse({
            ...stream,
            hasUpvoted: false,
            upvotes: 0
        }, 200);

    } catch (error)
    {
        return messageResponse(`Error while adding a stream. ${error}`, 400);
    }
}

export async function GET(req: NextRequest)
{
    const user = await getDbUser();
    if (!user)
        return messageResponse("Unauthenticated", 403);

    const [streams, activeStream] = await Promise.all([
        prismaClient.stream.findMany({
            where: {
                userId: req.nextUrl.searchParams.get("creatorId") ?? "",
                played: false
            },
            include: {
                _count: {
                    select: {
                        upvotes: true
                    }
                },
                upvotes: {
                    where: {
                        userId: user.id
                    }
                }
            }
        }),

        prismaClient.currentStream.findFirst({
            where: {
                userId: user.id
            },
            include: {
                stream: true
            }
        })
    ]);

    console.log(user.id);


    return jsonResponse({
        streams: streams.map(({ _count, ...rest }) => ({
            ...rest,
            upvotes: _count.upvotes,
            hasUpvoted: rest.upvotes.length ? true : false
        })),
        activeStream: activeStream
    }, 200);
}