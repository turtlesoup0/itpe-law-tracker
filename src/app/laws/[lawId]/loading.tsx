export default function LawDetailLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-6 bg-muted rounded w-20" />
      <div className="space-y-2">
        <div className="h-8 bg-muted rounded w-1/4" />
        <div className="h-4 bg-muted rounded w-1/2" />
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-9 bg-muted rounded w-20" />
        ))}
      </div>
      <div className="h-96 bg-muted rounded-lg" />
    </div>
  );
}
