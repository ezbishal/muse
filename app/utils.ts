import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { prismaClient } from "./lib/db";

export function messageResponse(message: string, statusCode: number)
{
    return NextResponse.json({
        message: message
    }, {
        status: statusCode
    })
}

export function jsonResponse(json: object, statusCode: number)
{
    return NextResponse.json(json, {
        status: statusCode
    })
}

export async function getDbUser()
{
    const session = await getServerSession();

    return await prismaClient.user.findFirst({
        where: {
            email: session?.user?.email ?? ""
        }
    })
}