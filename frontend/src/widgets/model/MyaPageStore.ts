import { create } from 'zustand';
import { MyPageModalTypes } from '@/shared/types/ModalType';
import { Store } from '../MyPage/types/myPageModalStoreType';

const useModalStore = create<Store>((set) => ({
  modalType: null,
  isShow: false,
  openModal: (type: MyPageModalTypes) =>
    set(() => ({ isShow: true, modalType: type })),
  closeModal: (type: MyPageModalTypes) =>
    set(() => ({ isShow: false, modalType: type })),
}));

export default useModalStore;
