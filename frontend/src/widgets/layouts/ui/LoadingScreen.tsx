import loading from '@/assets/icons/loading.png';

const LoadingScreen = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <img src={loading} className="h-12 w-12 animate-spin" />
    </div>
  );
};

export default LoadingScreen;
