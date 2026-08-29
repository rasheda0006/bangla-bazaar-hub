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
          ? "mx-auto mb-6 flex max-w-2xl flex-col items-center text-center"
          : "mb-6 grid gap-3 text-center md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:gap-4 md:text-left"
      }
    >
      <div className="min-w-0">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
        <span
          className={
            align === "center"
              ? "mx-auto mt-3 block h-1 w-16 rounded-full bg-primary"
              : "mx-auto mt-3 block h-1 w-16 rounded-full bg-primary md:hidden"
          }
        />
      </div>
      {action ? <div className="shrink-0 justify-self-center md:justify-self-end">{action}</div> : null}
    </div>
  );
}
