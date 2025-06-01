const SpinnerOverlay = () => {
  return (
    <div className="fixed inset-0 bg-white/70 z-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
};

export default SpinnerOverlay;
