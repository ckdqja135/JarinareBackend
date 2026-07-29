import { AuthStageProps } from '../../types/AuthType';
import { motion } from 'framer-motion';

const TOTAL_STAGES = 4;

const SignUpStageLine = ({ stage = 1 }: AuthStageProps) => {
  const percent = Math.round((stage / TOTAL_STAGES) * 100);
  const prevPercent = Math.round(((stage - 1) / TOTAL_STAGES) * 100);

  return (
    <div className="mb-[20px] flex w-full flex-col gap-y-[8px]">
      <div className="flex w-full items-center justify-between">
        <span className="text-xs text-gray-300">기본 정보</span>
        <span className="text-xs font-bold text-blue">{percent}%</span>
      </div>
      <div className="h-[4px] w-full rounded-full bg-lightGray">
        <motion.div
          initial={{ width: `${prevPercent}%` }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="h-[4px] rounded-full bg-blue"
        />
      </div>
    </div>
  );
};
export default SignUpStageLine;
