const RankPredictionShimmer = () => {
  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border p-6 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg shimmer" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 rounded shimmer" />
                <div className="h-6 w-32 rounded shimmer" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search Bar */}
      <div className="max-w-md">
        <div className="h-10 w-full rounded-lg shimmer" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="h-6 w-48 rounded shimmer mb-2" />
          <div className="h-4 w-64 rounded shimmer" />
        </div>

        {/* Table Head */}
        <div className="bg-gray-50 px-6 py-4 flex gap-6">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className="h-4 w-24 rounded shimmer"
            />
          ))}
        </div>

        {/* Table Rows */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="flex gap-6 px-6 py-4 border-b"
          >
            {[...Array(7)].map((_, j) => (
              <div
                key={j}
                className="h-4 w-full rounded shimmer"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RankPredictionShimmer;
