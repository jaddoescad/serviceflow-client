import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { loadQuoteShareSnapshot } from "@/lib/quote-share-loader.server";
import { WorkOrderShareDocument } from "@/components/work-orders/work-order-share-document";
import { LoadingPage } from "@/components/ui/loading-spinner";

export default function SecretWorkOrderPage() {
  const params = useParams();
  const navigate = useNavigate();
  const shareId = params.shareId as string;
  const [loading, setLoading] = useState(true);
  const [snapshot, setSnapshot] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await loadQuoteShareSnapshot(shareId);

        if (!data) {
          navigate("/");
          return;
        }

        setSnapshot(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load work order:", error);
        navigate("/");
      }
    }

    loadData();
  }, [shareId, navigate]);

  if (loading) {
    return <LoadingPage message="Loading work order..." />;
  }

  if (!snapshot) {
    return null;
  }

  return <WorkOrderShareDocument snapshot={snapshot} variant="secret" />;
}
