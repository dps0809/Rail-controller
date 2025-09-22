import { ReactNode } from "react";

export default function Placeholder({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="mx-auto grid max-w-[1400px] gap-4 p-4">
      <div className="rounded-md border bg-card p-8">
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="mt-2 text-muted-foreground">
          This page is a placeholder. Ask to generate its content when you are
          ready.
        </p>
        {children ? <div className="mt-4">{children}</div> : null}
      </div>
    </div>
  );
}
