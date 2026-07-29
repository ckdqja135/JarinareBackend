export const NoticeSkeleton = () => {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl bg-white shadow-sm">
      <div className="flex items-center gap-3 p-4 pb-2">
        <div className="h-8 w-8 rounded-full bg-gray-300" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-24 rounded bg-gray-300" />
          <div className="h-2 w-16 rounded bg-gray-200" />
        </div>
      </div>

      <div className="h-60 w-full bg-gray-200" />

      <div className="flex justify-between p-4 pt-3">
        <div className="flex gap-4">
          <div className="h-6 w-6 rounded bg-gray-300" />
          <div className="h-6 w-6 rounded bg-gray-300" />
        </div>
        <div className="h-6 w-6 rounded bg-gray-300" />
      </div>

      <div className="px-4 pb-1">
        <div className="h-3 w-32 rounded bg-gray-300" />
      </div>

      <div className="space-y-2 px-4 pb-2">
        <div className="h-3 w-40 rounded bg-gray-300" />
        <div className="h-3 w-full rounded bg-gray-200" />
        <div className="h-3 w-5/6 rounded bg-gray-200" />
      </div>
    </div>
  );
};
