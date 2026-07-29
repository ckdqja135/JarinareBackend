import loading from '@/assets/icons/loading.png';

const LoadingScreen = () => {
  return (
    <div className="absolute flex h-full w-full flex-col items-center justify-center bg-darkGray/50">
      <img src={loading} className="h-12 w-12 animate-spin" />
    </div>
  );
};

export default LoadingScreen;
