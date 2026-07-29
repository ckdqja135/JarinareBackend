/**
 * @role: widgets — hooks
 * @rule: response가 만료되면 모달 닫기, ui 파일에 사이드이펙트 포함 금지
 */
import { useEffect, useRef } from 'react';
import useModalStore from '@/widgets/model/Notification';
import { NotificationModalTypes } from '@/shared/types/ModalType';

export const useAutoCloseModal = (
  response: unknown[] | undefined,
  modalType: NotificationModalTypes,
) => {
  const { closeModal } = useModalStore();
  const hasResponse = useRef(false);

  useEffect(() => {
    if (response && response.length > 0) {
      hasResponse.current = true;
    } else if (hasResponse.current) {
      closeModal(modalType);
    }
  }, [response]);
};
