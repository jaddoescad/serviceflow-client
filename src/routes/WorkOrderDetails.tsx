import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { loadQuoteShareSnapshot } from "@/lib/quote-share-loader.server";
import { WorkOrderShareDocument } from "@/components/work-orders/work-order-share-document";
import { LoadingPage } from "@/components/ui/loading-spinner";

const workOrderKeys = {
  all: ["workOrders"] as const,
  detail: (shareId: string) => [...workOrderKeys.all, "detail", shareId] as const,
};

export default function WorkOrderDetailsPage() {
  const params = useParams();
  const navigate = useNavigate();
  const shareId = params.shareId as string;

  const {
    data: snapshot,
    isLoading,
    isError,
  } = useQuery({
    queryKey: workOrderKeys.detail(shareId),
    queryFn: () => loadQuoteShareSnapshot(shareId),
    enabled: !!shareId,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    if (isError || (snapshot === null && !isLoading)) {
      navigate("/");
    }
  }, [isError, snapshot, isLoading, navigate]);

  if (isLoading) {
    return <LoadingPage message="Loading work order..." />;
  }

  if (!snapshot) {
    return null;
  }

  return <WorkOrderShareDocument snapshot={snapshot} variant="standard" />;
}
