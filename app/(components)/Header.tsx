export default function Header({ title }: { title: string }) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      <div className="flex items-center gap-3">
        <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
          ● System Online
        </span>
        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
          QA
        </div>
      </div>
    </header>
  );
}
