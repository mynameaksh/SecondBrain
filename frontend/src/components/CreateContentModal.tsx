import { useState, type FormEvent } from "react";
import { CloseIcon } from "../icons/CloseIcon";
import Button from "./Button";

type ContentType = "twitter" | "youtube";

interface CreateContentModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: { title: string; link: string; type: ContentType }) => Promise<void>;
  isSubmitting: boolean;
}

function CreateContentModal({
  open,
  onClose,
  onSubmit,
  isSubmitting,
}: CreateContentModalProps) {
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [type, setType] = useState<ContentType>("twitter");
  const [error, setError] = useState("");

  if (!open) {
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!title.trim() || !link.trim()) {
      setError("Title and link are required.");
      return;
    }

    try {
      await onSubmit({
        title: title.trim(),
        link: link.trim(),
        type,
      });
      setTitle("");
      setLink("");
      setType("twitter");
      onClose();
    } catch (submissionError) {
      const message =
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to add content.";
      setError(message);
    }
  }

  return (
    <div className="fixed inset-0 z-20 bg-black/35 p-4">
      <div className="mx-auto mt-10 w-full max-w-md rounded-lg bg-white p-4 shadow-lg">
        <div className="mb-3 flex justify-end">
          <button
            type="button"
            className="cursor-pointer text-gray-600 hover:text-gray-900"
            onClick={onClose}
            aria-label="Close modal"
          >
            <CloseIcon />
          </button>
        </div>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Enter title"
            type="text"
            className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-[#7164c0]"
          />
          <input
            value={link}
            onChange={(event) => setLink(event.target.value)}
            placeholder="Enter link"
            type="url"
            className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-[#7164c0]"
          />
          <select
            value={type}
            onChange={(event) => setType(event.target.value as ContentType)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-[#7164c0]"
          >
            <option value="twitter">Twitter</option>
            <option value="youtube">YouTube</option>
          </select>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <Button
            type="submit"
            variant="primary"
            text={isSubmitting ? "Saving..." : "Submit"}
            disabled={isSubmitting}
            fullWidth
          />
        </form>
      </div>
    </div>
  );
}

export default CreateContentModal;
