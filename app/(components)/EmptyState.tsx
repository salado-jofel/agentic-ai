type EmptyStateProps = {
  icon: string;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
};

export default function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <span className="text-5xl mb-4">{icon}</span>
      <h3 className="text-gray-700 font-semibold text-lg">{title}</h3>
      <p className="text-gray-400 text-sm mt-1 max-w-xs">{description}</p>
      {action && (
        <a
          href={action.href}
          className="mt-6 bg-purple-600 hover:bg-purple-700 text-white
            px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          {action.label}
        </a>
      )}
    </div>
  );
}
