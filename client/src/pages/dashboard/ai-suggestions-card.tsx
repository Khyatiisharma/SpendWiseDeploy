import { AlertCircle, RefreshCw, Sparkles } from "lucide-react";
import { useAiTransactionSuggestionsQuery } from "@/features/transaction/transactionAPI";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

const priorityStyles = {
  high: "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300",
  medium:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300",
  low: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300",
};

const AiSuggestionsCard = () => {
  const { data, error, isFetching, isError, refetch } =
    useAiTransactionSuggestionsQuery();

  const suggestions = data?.data?.suggestions || [];
  const errorMessage = getApiErrorMessage(error);
  const generatedAt = data?.data?.generatedAt
    ? new Date(data.data.generatedAt).toLocaleString()
    : null;

  return (
    <Card className="overflow-hidden border-1 border-gray-100 !shadow-none dark:border-border">
      <CardHeader className="border-b bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="mb-2 flex items-center gap-2 text-emerald-200">
              <Sparkles className="size-4" />
              <span className="text-xs font-medium uppercase tracking-[0.18em]">
                Groq AI
              </span>
            </div>
            <CardTitle className="text-xl">Smart Suggestions</CardTitle>
            <p className="mt-2 text-sm text-slate-300">
              {data?.data?.summary ||
                "Personalized ideas based on your transaction data."}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            disabled={isFetching}
            onClick={() => refetch()}
          >
            <RefreshCw
              className={cn("size-4", isFetching && "animate-spin")}
            />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {isFetching ? (
          <AiSuggestionsSkeleton />
        ) : isError ? (
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
            <AlertCircle className="mt-0.5 size-4" />
            <div>
              <p className="text-sm font-medium">
                AI suggestions are unavailable.
              </p>
              <p className="mt-1 text-xs opacity-80">
                {errorMessage || "Check Groq API quota/key and try refreshing."}
              </p>
            </div>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            Add or import transactions to get AI suggestions.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {suggestions.map((suggestion, index) => (
              <div
                key={`${suggestion.title}-${index}`}
                className="rounded-xl border bg-card p-4 shadow-sm"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <h3 className="text-sm font-semibold leading-5">
                    {suggestion.title}
                  </h3>
                  <Badge
                    variant="outline"
                    className={cn(
                      "capitalize",
                      priorityStyles[suggestion.priority]
                    )}
                  >
                    {suggestion.priority}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {suggestion.message}
                </p>
                {suggestion.category && (
                  <p className="mt-3 text-xs font-medium capitalize text-emerald-600 dark:text-emerald-400">
                    Category: {suggestion.category}
                  </p>
                )}
                <div className="mt-4 rounded-lg bg-muted/70 p-3 text-xs font-medium">
                  Action: {suggestion.action}
                </div>
              </div>
            ))}
          </div>
        )}
        {generatedAt && !isFetching && !isError && (
          <p className="mt-3 text-right text-[11px] text-muted-foreground">
            Generated {generatedAt}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

const AiSuggestionsSkeleton = () => (
  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
    {[1, 2, 3, 4].map((item) => (
      <div key={item} className="rounded-xl border p-4">
        <div className="mb-3 flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-5 w-14" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-4/5" />
        <Skeleton className="mt-4 h-10 w-full" />
      </div>
    ))}
  </div>
);

const getApiErrorMessage = (error: unknown) => {
  const fetchError = error as FetchBaseQueryError | undefined;

  if (!fetchError || !("data" in fetchError)) return "";

  const data = fetchError.data as { message?: string; error?: string } | string;

  if (typeof data === "string") return data;

  return data?.message || data?.error || "";
};

export default AiSuggestionsCard;
