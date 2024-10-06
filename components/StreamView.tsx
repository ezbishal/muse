"use client";

import { Input } from "@/components/ui/input";
import { SkipForward } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThumbsUp } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Appbar } from "@/components/Appbar";
import axios from "axios";
import { toast } from "@/hooks/use-toast";

export interface Stream {
  id: string;
  type: string;
  url: string;
  title: string;
  artist: string;
  smallImg: string;
  bigImg: string;
  extractedId: string;
  active: boolean;
  userId: string;
  addedById: string;
  upvotes: number;
  hasUpvoted: boolean;
}

export default function StreamView({
  creatorId,
  viewOnly,
}: {
  creatorId: string;
  viewOnly: boolean;
}) {
  useEffect(() => {
    refreshStreams();
  }, []);

  const [streams, setStreams] = useState<Stream[]>([]);
  const [activeStream, setActiveStream] = useState<Stream | null>(streams[0]);
  const [youtubeLink, setYoutubeLink] = useState<string>("");
  const [embedLink, setEmbedLink] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [playNextLoader, setPlayNextLoader] = useState<boolean>(false);

  async function refreshStreams() {
    const response = await axios.get(`/api/streams/?creatorId=${creatorId}`);

    const streams: Stream[] = response.data.streams;
    const activeStream: Stream = response.data.activeStream?.stream;

    setStreams(streams.sort((a, b) => (a.upvotes > b.upvotes ? -1 : 1)));
    setActiveStream((stream) =>
      stream?.id === activeStream?.id ? stream : activeStream
    );
  }

  const sharePage = () => {
    navigator.clipboard
      .writeText(`${window.location.hostname}/creator/${creatorId}`)
      .then(() => {
        toast({
          title: "Link Copied",
          description: "The page link has been copied to your clipboard.",
        });
      });
  };

  const handleYoutubeLinkChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newYoutubeLink: string = e.target.value;
    setYoutubeLink(newYoutubeLink);
    setEmbedLink(newYoutubeLink.replace("/watch?v=", "/embed/"));
  };

  const addStream = async () => {
    setLoading(true);
    const response = await axios.post("/api/streams", {
      url: youtubeLink,
      creatorId: creatorId,
    });
    setLoading(false);
    if (response.status == 200) {
      toast({
        title: "Song Added",
        description: "The song has been added to the voting list.",
      });

      refreshStreams();
    } else {
      toast({
        title: "Unable to add the song",
        description: "The song was not added to the voting list.",
      });
    }
  };

  const handleUpvote = async (stream: Stream): Promise<void> => {
    try {
      if (stream.hasUpvoted) {
        await axios.delete("/api/streams/upvote", {
          params: {
            streamId: stream.id,
          },
        });
      } else {
        await axios.post("/api/streams/upvote", {
          streamId: stream.id,
        });
      }

      refreshStreams();
    } catch (error) {
      toast({
        title: "Error while sending request",
        description: "Unable to post upvote",
      });
    }
  };

  const nextStream = async () => {
    setPlayNextLoader(true);

    const response = await axios.get("/api/streams/next");
    setActiveStream(response.data.stream);
    await refreshStreams();

    setPlayNextLoader(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      <Appbar
        fragment={
          <Button
            onClick={sharePage}
            variant="outline"
            size="sm"
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        }
      />
      <div className="flex flex-col items-center gap-3">
        <div className="w-3/4 flex-grow space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stream list */}
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <h2 className="text-l font-bold mb-4">Top Voted Songs</h2>
              <ScrollArea className="h-[550px] w-full rounded-md border border-gray-700">
                <div className="space-y-4 p-4">
                  {Array.isArray(streams) &&
                    streams.map((stream) => (
                      <SongItem
                        key={stream.id}
                        stream={stream}
                        handleUpvote={handleUpvote}
                      />
                    ))}
                </div>
              </ScrollArea>
            </div>

            <div className="flex flex-col gap-3">
              {/* Add Stream */}
              <div className="bg-white bg-opacity-10 rounded-lg p-6 h-1/2">
                <h2 className="text-l font-bold mb-4">Add New Song</h2>
                <div className="flex gap-1 mb-2">
                  <div className="w-3/4">
                    <Input
                      type="text"
                      placeholder="Paste YouTube link here"
                      value={youtubeLink}
                      onChange={handleYoutubeLinkChange}
                      className="w-full"
                    />
                  </div>
                  <div className="w-1/4">
                    <Button onClick={addStream} className="w-full">
                      {loading ? "Loading..." : "Add Song"}
                    </Button>
                  </div>
                </div>
                <div className="space-y-4">
                  <iframe
                    width="320px"
                    height="180px"
                    src={embedLink}
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>

              {/* Now playing */}
              <div className="bg-white bg-opacity-10 rounded-lg p-6 h-1/2">
                <h2 className="text-l font-bold mb-4">Now Playing</h2>
                <div className="space-y-4">
                  <iframe
                    width="320px"
                    height="180px"
                    src={activeStream?.url}
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                <div className="mt-2 flex-col justify-between items-center gap-3">
                  <span>{activeStream?.title ?? ""}</span>
                  <p className="text-lg">{activeStream?.artist}</p>
                  {!viewOnly && (
                    <Button
                      onClick={nextStream}
                      size="lg"
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      {" "}
                      <SkipForward className="mr-2 h-4 w-4" />
                      {playNextLoader ? "Loading..." : "Play Next"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SongItem({
  stream,
  handleUpvote,
}: {
  stream: Stream;
  handleUpvote: (stream: Stream) => void;
}) {
  return (
    <div className="flex items-center justify-between bg-white bg-opacity-5 rounded-lg p-1">
      <Image
        src={stream.smallImg}
        alt="Video Thumbnail"
        width={50}
        height={50}
        className="mx-1"
      />
      <div className="flex-grow">
        <h3 className="font-500">{stream.title}</h3>
        <p className="text-xs text-gray-300">{stream.artist}</p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleUpvote(stream)}
        className="flex items-center space-x-2 hover:bg-white hover:bg-opacity-10"
      >
        {stream.hasUpvoted && <ThumbsUp fill={"black"} className="h-4 w-4" />}
        {!stream.hasUpvoted && <ThumbsUp className="h-4 w-4" />}
        <span>{stream.upvotes}</span>
      </Button>
    </div>
  );
}
