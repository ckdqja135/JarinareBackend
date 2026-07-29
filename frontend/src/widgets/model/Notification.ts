import { create } from 'zustand';
import { Store } from '../Notification/types/NotificationType';
import { NotificationModalTypes } from '@/shared/types/ModalType';

const useNotifiModalStore = create<Store>((set) => ({
  modalType: null,
  isShow: false,
  openModal: (type: NotificationModalTypes) =>
    set(() => ({ isShow: true, modalType: type })),
  closeModal: (type: NotificationModalTypes) =>
    set(() => ({ isShow: false, modalType: type })),
}));

export default useNotifiModalStore;
