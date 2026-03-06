import { useEffect } from "react";
import { DeleteIcon } from "../icons/DeleteIcon";
import { ShareIcon } from "../icons/ShareIcon";

interface CardProps {
  id: string;
  title: string;
  link: string;
  type: "twitter" | "youtube";
  onDelete?: (id: string) => void;
}

declare global {
  interface Window {
    twttr?: {
      widgets?: {
        load: () => void;
      };
    };
  }
}

function getYouTubeEmbedUrl(link: string): string {
  if (link.includes("watch?v=")) {
    return link.replace("watch?v=", "embed/");
  }
  if (link.includes("youtu.be/")) {
    return link.replace("youtu.be/", "www.youtube.com/embed/");
  }
  return link;
}

function Card({ id, title, link, type, onDelete }: CardProps) {
  useEffect(() => {
    if (type === "twitter") {
      window.twttr?.widgets?.load();
    }
  }, [type, link]);

  return (
    <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-md line-clamp-1 font-medium">{title}</div>
        <div className="flex items-center gap-2 text-gray-600">
          <a
            href={link}
            target="_blank"
            rel="noreferrer"
            className="hover:text-gray-900"
            aria-label="Open content in a new tab"
          >
            <ShareIcon />
          </a>
          {onDelete ? (
            <button
              type="button"
              onClick={() => onDelete(id)}
              className="cursor-pointer hover:text-red-600"
              aria-label="Delete content"
            >
              <DeleteIcon />
            </button>
          ) : null}
        </div>
      </div>

      <div className="min-h-48">
        {type === "youtube" ? (
          <iframe
            className="min-h-48 w-full rounded-md"
            src={getYouTubeEmbedUrl(link)}
            title={`YouTube video: ${title}`}
            frameBorder={0}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <blockquote className="twitter-tweet">
            <a href={link.replace("x.com", "twitter.com")}></a>
          </blockquote>
        )}
      </div>
    </div>
  );
}

export default Card;
