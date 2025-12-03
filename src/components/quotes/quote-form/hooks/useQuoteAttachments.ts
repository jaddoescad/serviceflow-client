import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from "react";
import { createProposalAttachmentsRepository } from "@/services/proposal-attachments";
import type { ProposalAttachmentAsset } from "@/types/proposal-attachments";
import { createImageThumbnail, isImageContentType } from "@/lib/attachments";

type UseQuoteAttachmentsProps = {
  companyId: string;
  dealId: string;
  quoteId: string | undefined;
  initialAttachments: ProposalAttachmentAsset[];
};

export function useQuoteAttachments({
  companyId,
  dealId,
  quoteId,
  initialAttachments,
}: UseQuoteAttachmentsProps) {
  const attachmentsRepository = useMemo(() => createProposalAttachmentsRepository(), []);

  const [attachments, setAttachments] = useState<ProposalAttachmentAsset[]>(() => initialAttachments);
  const [pendingUploads, setPendingUploads] = useState<
    Array<{ id: string; previewUrl: string; fileName: string }>
  >([]);
  const [attachmentsError, setAttachmentsError] = useState<string | null>(null);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [activeAttachmentIndex, setActiveAttachmentIndex] = useState<number | null>(null);
  const [deletingAttachmentId, setDeletingAttachmentId] = useState<string | null>(null);

  const imageAttachments = useMemo(
    () => attachments.filter((attachment) => isImageContentType(attachment.content_type)),
    [attachments]
  );

  // Sync attachment index bounds
  useEffect(() => {
    if (activeAttachmentIndex === null) return;

    if (imageAttachments.length === 0) {
      setActiveAttachmentIndex(null);
      return;
    }

    if (activeAttachmentIndex > imageAttachments.length - 1) {
      setActiveAttachmentIndex(imageAttachments.length - 1);
    }
  }, [activeAttachmentIndex, imageAttachments]);

  // Initialize attachments from server
  useEffect(() => {
    if (!quoteId) {
      setAttachments([]);
      return;
    }

    if (initialAttachments.length > 0 && attachments.length === 0) {
      setAttachments(initialAttachments);
    }
  }, [quoteId, initialAttachments, attachments.length]);

  // Cleanup preview URLs
  useEffect(() => {
    return () => {
      pendingUploads.forEach((pending) => URL.revokeObjectURL(pending.previewUrl));
    };
  }, [pendingUploads]);

  const handleAttachmentsUpload = useCallback(
    async (files: FileList | File[]) => {
      if (!quoteId) {
        setAttachmentsError("Save the quote before uploading attachments.");
        return;
      }

      const selectedFiles = Array.from(files ?? []).filter(Boolean);
      if (selectedFiles.length === 0) return;

      setIsUploadingAttachment(true);
      setAttachmentsError(null);

      let encounteredError: string | null = null;
      let skippedUnsupported = false;

      const uploadTasks: Promise<void>[] = [];

      selectedFiles.forEach((file) => {
        if (!isImageContentType(file.type)) {
          skippedUnsupported = true;
          return;
        }

        const pendingId = crypto.randomUUID();
        const previewUrl = URL.createObjectURL(file);

        setPendingUploads((current) => [
          { id: pendingId, previewUrl, fileName: file.name || "attachment" },
          ...current,
        ]);

        const task = (async () => {
          try {
            const thumbnailResult = await createImageThumbnail(file, 512);
            const asset = await attachmentsRepository.uploadAttachment({
              companyId,
              dealId,
              quoteId,
              file,
              thumbnail: thumbnailResult?.blob ?? null,
              thumbnailContentType: thumbnailResult?.contentType ?? null,
            });

            setAttachments((current) => [asset, ...current]);
          } catch (error) {
            console.error("Failed to upload proposal attachment", error);
            encounteredError = "We couldn't upload one or more images. Please try again.";
            throw error;
          } finally {
            setPendingUploads((current) => current.filter((pending) => pending.id !== pendingId));
            URL.revokeObjectURL(previewUrl);
          }
        })();

        uploadTasks.push(task);
      });

      if (uploadTasks.length > 0) {
        await Promise.allSettled(uploadTasks);
      }

      setIsUploadingAttachment(false);

      if (encounteredError || skippedUnsupported) {
        setAttachmentsError(encounteredError ?? "Only image files can be uploaded right now.");
      }
    },
    [attachmentsRepository, companyId, dealId, quoteId]
  );

  const handleAttachmentInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (!event.target.files) return;
      void handleAttachmentsUpload(event.target.files);
      event.target.value = "";
    },
    [handleAttachmentsUpload]
  );

  const handleAttachmentDelete = useCallback(
    async (attachment: ProposalAttachmentAsset) => {
      setAttachmentsError(null);

      try {
        await attachmentsRepository.deleteAttachment({
          attachmentId: attachment.id,
        });
        setAttachments((current) => current.filter((item) => item.id !== attachment.id));
      } catch (error) {
        console.error("Failed to delete proposal attachment", error);
        setAttachmentsError("We couldn't delete that attachment. Please try again.");
      }
    },
    [attachmentsRepository]
  );

  const handleOpenAttachment = useCallback((index: number) => {
    setActiveAttachmentIndex(index);
  }, []);

  const handleCloseAttachment = useCallback(() => {
    setActiveAttachmentIndex(null);
  }, []);

  const handleStepAttachment = useCallback(
    (direction: -1 | 1) => {
      setActiveAttachmentIndex((current) => {
        if (current === null || imageAttachments.length === 0) return current;
        const nextIndex = (current + direction + imageAttachments.length) % imageAttachments.length;
        return nextIndex;
      });
    },
    [imageAttachments.length]
  );

  // Keyboard navigation
  useEffect(() => {
    if (activeAttachmentIndex === null) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleCloseAttachment();
      } else if (event.key === "ArrowRight") {
        handleStepAttachment(1);
      } else if (event.key === "ArrowLeft") {
        handleStepAttachment(-1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeAttachmentIndex, handleCloseAttachment, handleStepAttachment]);

  return {
    attachments,
    pendingUploads,
    imageAttachments,
    attachmentsError,
    isUploadingAttachment,
    deletingAttachmentId,
    activeAttachmentIndex,
    handleAttachmentInputChange,
    handleAttachmentDelete,
    handleOpenAttachment,
    handleCloseAttachment,
    handleStepAttachment,
  };
}
