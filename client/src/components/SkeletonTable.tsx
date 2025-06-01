const SkeletonTable = ({ rows = 5 }: { rows?: number }) => {
  return (
    <tbody>
      {[...Array(rows)].map((_, idx) => (
        <tr key={idx} className="animate-pulse">
          <td className="p-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </td>
          <td className="p-3">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </td>
          <td className="p-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </td>
          <td className="p-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </td>
          <td className="p-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </td>
        </tr>
      ))}
    </tbody>
  );
};

export default SkeletonTable;
