export default function ChartSkeleton({ height = 220 }: { height?: number }) {
  return (
    <div
      className="w-full rounded-xl bg-white/[0.03] animate-pulse"
      style={{ height }}
    >
      <div className="h-full flex items-end justify-around px-4 pb-4 gap-2">
        {[65, 40, 80, 55, 90, 45, 70, 35, 75, 50, 85, 60].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t bg-white/[0.05]"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}
