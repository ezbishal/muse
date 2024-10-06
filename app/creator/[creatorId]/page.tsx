import StreamView from "@/components/StreamView";

export default function Component({ params: { creatorId } } : { params : { creatorId: string}})
{
    return <StreamView creatorId={creatorId} viewOnly={true} />; 
}