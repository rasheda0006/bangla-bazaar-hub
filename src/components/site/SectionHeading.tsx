export function SectionHeading({
  title,
  subtitle,
  align = "center",
  action,
}: {
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  action?: React.ReactNode;
}) {
  return (
    <div
      className={
        align === "center"
          ? "mx-auto mb-6 max-w-2xl text-center"
          : "mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4"
      }
    >
      <div className="min-w-0">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
        {align === "center" ? (
          <span className="mx-auto mt-3 block h-1 w-16 rounded-full bg-primary" />
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
