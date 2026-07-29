import { useHideRoute } from '../hooks/useHideRoute';
import { StartTimeNotificationModal } from './StartTimeNotificationModal';
import { useControlStartTime } from '../hooks/useControlStartTime';
import { memo, useMemo } from 'react';

const Modal = memo(() => {
  const { hideRoute } = useHideRoute();
  const { timeDifferenceData } = useControlStartTime();

  // 특정 경로에서는 Modal을 렌더링하지 않음
  // 의존성(hideRoute, timeDifferenceData)이 바뀔 때만 계산
  const shouldRender = useMemo(() => {
    return !hideRoute && timeDifferenceData[0].length > 0;
  }, [hideRoute, timeDifferenceData]);

  if (!shouldRender) return null;

  return (
    <div className="absolute">
      {timeDifferenceData.map((item, idx) => (
        <StartTimeNotificationModal key={idx} timeDifferenceData={item} />
      ))}
    </div>
  );
});

Modal.displayName = 'Modal';

export default Modal;
