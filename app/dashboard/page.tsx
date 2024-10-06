import StreamView from "@/components/StreamView";
import { getDbUser, messageResponse } from "../utils";

export default async function Dashboard() {
  const user = await getDbUser();
  if (!user) return messageResponse("Unauthenticated", 403);

  return <StreamView creatorId={user.id} viewOnly={false} />;
}
