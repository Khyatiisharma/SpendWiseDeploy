import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScanText } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { AIScanReceiptData } from "@/features/transaction/transationType";
import { toast } from "sonner";
import { useProgressLoader } from "@/hooks/use-progress-loader";
import { useAiScanReceiptMutation } from "@/features/transaction/transactionAPI";

type SampleReceipt = {
  label: string;
  merchant: string;
  lines: string[];
  data: AIScanReceiptData;
};

const createReceiptPreview = (sample: SampleReceipt) => {
  const lineItems = sample.lines
    .map(
      (line, index) =>
        `<text x="24" y="${122 + index * 22}" font-size="15">${line}</text>`
    )
    .join("");

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="420" height="560" viewBox="0 0 420 560">
      <rect width="420" height="560" fill="#f7f1e8"/>
      <rect x="28" y="24" width="364" height="512" rx="10" fill="#fffdfa" stroke="#d8cbbb"/>
      <text x="210" y="66" text-anchor="middle" font-size="24" font-family="Arial" font-weight="700">${sample.merchant}</text>
      <text x="210" y="92" text-anchor="middle" font-size="13" font-family="Arial">Sample receipt for SpendWise scanner</text>
      <line x1="52" y1="106" x2="368" y2="106" stroke="#d8cbbb" stroke-dasharray="6 5"/>
      <g font-family="Arial" fill="#24211f">${lineItems}</g>
      <line x1="52" y1="440" x2="368" y2="440" stroke="#d8cbbb" stroke-dasharray="6 5"/>
      <text x="52" y="478" font-size="18" font-family="Arial" font-weight="700">TOTAL</text>
      <text x="368" y="478" text-anchor="end" font-size="18" font-family="Arial" font-weight="700">$${sample.data.amount.toFixed(
        2
      )}</text>
      <text x="210" y="512" text-anchor="middle" font-size="12" font-family="Arial">Thank you</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const sampleReceipts: SampleReceipt[] = [];

interface ReceiptScannerProps {
  loadingChange: boolean;
  onScanComplete: (data: AIScanReceiptData) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

const ReceiptScanner = ({
  loadingChange,
  onScanComplete,
  onLoadingChange,
}: ReceiptScannerProps) => {
  const [receipt, setReceipt] = useState<string | null>(null);

  const {
    progress,
    startProgress,
    updateProgress,
    doneProgress,
    resetProgress,
  } = useProgressLoader({ initialProgress: 10, completionDelay: 500 });

  const [aiScanReceipt] = useAiScanReceiptMutation();

  const handleSampleReceipt = (sample: SampleReceipt) => {
    const receiptUrl = createReceiptPreview(sample);

    setReceipt(receiptUrl);
    startProgress(25);
    updateProgress(70);
    onLoadingChange(true);

    window.setTimeout(() => {
      updateProgress(100);
      onScanComplete({
        ...sample.data,
        receiptUrl,
      });
      toast.success(`${sample.label} sample scanned successfully`);
      doneProgress();
      resetProgress();
      setReceipt(null);
      onLoadingChange(false);
    }, 450);
  };

  const handleReceiptUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const input = event.target;
    const file = event.target.files?.[0];
    if (!file) {
      toast.error("Please select a file");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    const formData = new FormData();
    formData.append("receipt", file);

    startProgress(10);
    onLoadingChange(true);
    // Simulate file upload and processing
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setReceipt(result);

      // Simulate scanning progress
      // Start progress
      let currentProgress = 10;
      const interval = setInterval(() => {
        const increment = currentProgress < 90 ? 10 : 1;
        currentProgress = Math.min(currentProgress + increment, 90);
        updateProgress(currentProgress);
      }, 250);

      aiScanReceipt(formData)
        .unwrap()
        .then((res) => {
          if (!res.data?.amount || !res.data?.date) {
            throw new Error("Receipt missing required information");
          }

          updateProgress(100);
          onScanComplete(res.data);
          toast.success("Receipt scanned successfully");
        })
        .catch((error) => {
          toast.error(
            error?.data?.message || error?.message || "Failed to scan receipt"
          );
        })
        .finally(() => {
          clearInterval(interval);
          doneProgress();
          resetProgress();
          setReceipt(null);
          input.value = "";
          onLoadingChange(false);
        });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">AI Scan Receipt</Label>
      <div className="flex items-start gap-3 border-b pb-4">
        {/* Receipt Preview */}
        <div
          className={`h-12 w-12 rounded-md border bg-cover bg-center ${
            !receipt ? "bg-muted" : ""
          }`}
          style={receipt ? { backgroundImage: `url(${receipt})` } : {}}
        >
          {!receipt && (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <ScanText color="currentColor" className="h-5 w-5 !stroke-1.5" />
            </div>
          )}
        </div>

        {/* Upload Input or Progress */}
        <div className="flex-1">
          {!loadingChange ? (
            <>
              <Input
                type="file"
                accept="image/*"
                onChange={handleReceiptUpload}
                className="max-w-[250px] px-1 h-9 cursor-pointer text-sm file:mr-2 
            file:rounded file:border-0 file:bg-primary file:px-3 file:py-px
             file:text-sm file:font-medium file:text-white 
             hover:file:bg-primary/90"
                disabled={loadingChange}
              />
              <p className="mt-2 text-[11px] px-2 text-muted-foreground">
                JPG, PNG up to 5MB
              </p>
            </>
          ) : (
            <div className="space-y-2 pt-3">
              <Progress value={progress} className="h-2 w-[250px]" />
              <p className="text-xs text-muted-foreground">
                Scanning receipt... {progress}%
              </p>
            </div>
          )}
        </div>
      </div>
      {sampleReceipts.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {sampleReceipts.map((sample) => (
            <Button
              key={sample.label}
              type="button"
              variant="outline"
              size="sm"
              className="h-8 px-2 text-xs"
              disabled={loadingChange}
              onClick={() => handleSampleReceipt(sample)}
            >
              {sample.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReceiptScanner;
