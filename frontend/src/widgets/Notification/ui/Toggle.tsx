import { ToggleType } from '../types/toggleType';
import { motion } from 'framer-motion';

export const Toggle = ({ handleToggle, toggle }: ToggleType) => {
  return (
    <div
      className={`flex justify-end rounded-full duration-200 ${toggle ? 'bg-blue' : 'bg-lightGray'} flex h-[30px] w-[55px] items-center p-[3px]`}
      onClick={handleToggle}
    >
      <motion.div
        layout
        className={`h-[24px] w-[24px] rounded-full bg-white`}
        animate={{
          x: toggle ? 0 : -25,
        }}
        transition={{ type: 'tween', duration: 0.15 }}
      />
    </div>
  );
};
