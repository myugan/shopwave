export default function AnnouncementBar() {
  return (
    <div className="bg-slate-900 text-slate-200 text-center text-xs sm:text-sm py-2.5 px-4">
      <p>
        <span className="text-indigo-300 font-medium">Free shipping</span> on orders over $100
        <span className="hidden sm:inline"> · </span>
        <span className="block sm:inline mt-0.5 sm:mt-0 text-slate-400">
          2-day delivery on in-stock items
        </span>
      </p>
    </div>
  )
}
