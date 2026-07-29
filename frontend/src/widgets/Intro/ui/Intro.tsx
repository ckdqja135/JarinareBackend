import intro from '@/assets/logo/intro.png';
import { useIntroAnimation } from '@/features/Intro/hooks/useIntroAnimation';

const Intro = () => {
  const { isFade, isHide } = useIntroAnimation();
  return (
    <div
      className={`flex h-screen ${isFade ? 'animate-intro_fadein' : 'animate-intro_fadeout'}`}
    >
      <div className="flex w-full flex-col items-center justify-center pl-[28px] pr-[27px]">
        {isHide ? <img src={intro} width={200} height={200} /> : null}
      </div>
    </div>
  );
};

export default Intro;
