import { filter_reports } from "@/lib/server/metrics";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export function useEyeTrackingChart(timeFilter: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["eyeTrackingSummary", timeFilter],
    queryFn: () => filter_reports({filter: timeFilter}),
  });

  // Convert server data into chart format
  const chartData = useMemo(() => {
    if (!data) return [];

    return data.map((entry) => ({
      time: new Date(entry.interval).toLocaleString("en-IN", {
        hour: "2-digit",
        day: "2-digit",
        month: "short",
      }),
      blinkRate: entry.totalBlinks,
      attention: Math.round(entry.totalAttention),
      strain: entry.averageStrain,
      eyeAge: entry.maxEyeAge,
    }));
  }, [data]);

  return { chartData, isLoading, error };
}