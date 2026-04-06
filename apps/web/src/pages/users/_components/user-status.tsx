export default function UserStatus({ active }: { active: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className={`w-1.5 h-1.5 rounded-full ${
          active ? "bg-emerald-500" : "bg-neutral-400"
        }`}
      />
      <span className="text-sm text-muted-foreground">
        {active ? "Active" : "Inactive"}
      </span>
    </div>
  );
}
