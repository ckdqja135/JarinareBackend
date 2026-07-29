import {
  useCheckStationStore,
  usePlaceInputStore,
} from '../model/PlaceInputStroe';

export const useHideInput = () => {
  const { isShow, setIsShow } = usePlaceInputStore();
  const { setIsValue } = useCheckStationStore();
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsValue(e.target.value);
    if (e.target.value !== '') {
      setIsShow(true);
    } else {
      setIsShow(false);
    }
  };

  return { isShow, onChange };
};
