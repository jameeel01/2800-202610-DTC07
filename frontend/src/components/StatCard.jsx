function StatCard({ value, label, subtext, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-1">
      {children ? (
        children
      ) : (
        <span className="text-4xl font-bold text-[#2d5a27]">{value}</span>
      )}
      <span className="text-base font-bold text-gray-900">{label}</span>
      <span className="text-sm text-gray-400">{subtext}</span>
    </div>
  );
}

export default StatCard;
