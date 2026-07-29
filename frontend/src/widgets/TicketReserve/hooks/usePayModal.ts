/**
 * @role: widgets/TicketReserve — hooks
 * @rule: PayModal 상태·파생값·핸들러만 담당, UI 포함 금지
 */
import { useState } from 'react';
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import useModalStore from '../../model/ReserveStore';
import { useSeatQueryData } from '@/features/TicketReserve/hooks/useSeatQueryData';
import { useGetPoint } from '@/features/Point/hooks/useGetPoint';
import { useUpdatePoint } from '@/features/Point/hooks/useUpdatePoint';
import { seatsStateCountStore } from '@/features/TicketReserve/model/seatsStateCountStore';
import { useSaveReserveStat } from '@/features/TicketReserve/hooks/useSaveReserveStat';
import { useCreateOrder } from '@/features/Point/hooks/useCreateOrder';
import { useCurrentSeason } from '@/features/Season/hooks/useCurrentSeason';
import {
  PAYMENT_METHODS,
  CARD_LIST,
  type PaymentMethod,
  type CardName,
} from '../constants/payModalConstants';

export const usePayModal = () => {
  const { closeModal } = useModalStore();
  const {
    selectPay,
    endStationForView,
    startStationForView,
    startDay,
    startDayForView,
    selectTrainType,
    selectAdult,
    selectKid,
  } = trainDataStore();
  const { createSelectedSeats } = useSeatQueryData();
  const { saveStat } = useSaveReserveStat();
  const { createOrder } = useCreateOrder();
  const { point } = useGetPoint();
  const { updatePoint } = useUpdatePoint();
  const { seatsStateCount } = seatsStateCountStore();
  const { season, style, isSeasonStation } = useCurrentSeason();

  const [checked, setChecked] = useState(false);
  const [value, setValue] = useState<number | null>(null);
  const [eventSelected, setEventSelected] = useState<'none' | 'season'>('none');
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod | null>(null);
  const [selectedCard, setSelectedCard] = useState<CardName | null>(null);
  const [isPaying, setIsPaying] = useState(false);

  const isDiscountEligible = isSeasonStation(endStationForView);
  const basePrice = selectPay * seatsStateCount;
  const discountedBase =
    eventSelected === 'season' && isDiscountEligible
      ? Math.floor(basePrice * 0.9)
      : basePrice;
  const pointValue = Number(value);

  const selectedCardData = CARD_LIST.find((c) => c.name === selectedCard);
  const cardDiscount =
    selectedPaymentMethod === '신용카드' && selectedCardData
      ? Math.floor(discountedBase * selectedCardData.discount)
      : 0;

  const finalPrice = discountedBase - pointValue - cardDiscount;

  const cardPayback =
    selectedPaymentMethod === '신용카드' && selectedCardData
      ? Math.floor(finalPrice * selectedCardData.payback)
      : 0;

  const cardDiscountRate = Math.round((selectedCardData?.discount ?? 0) * 100);
  const cardPaybackRate = Math.round((selectedCardData?.payback ?? 0) * 100);

  const bannerText = selectedCardData
    ? 'note' in selectedCardData
      ? `${selectedCard}카드 ${(selectedCardData as { note: string }).note} 이벤트 적용`
      : `${selectedCard}카드 ${Math.round(selectedCardData.discount * 100)}% 할인 이벤트 적용`
    : null;

  const processedCardList = CARD_LIST.map((card) => ({
    name: card.name,
    badge: card.badge,
    color: card.color,
    bannerColor: card.bannerColor,
    note:
      'note' in card ? (card as unknown as { note: string }).note : undefined,
    noteColor:
      'noteColor' in card
        ? (card as unknown as { noteColor: string }).noteColor
        : undefined,
  }));

  const handleEventChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEventSelected(e.target.value as 'none' | 'season');
  };

  const handleTogglePoint = () => setChecked((prev) => !prev);
  const handleUseAllPoint = () => setValue(point);
  const handleClose = () => closeModal('PayModal');

  const handleSelectPaymentMethod = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
    if (method !== '신용카드') setSelectedCard(null);
  };

  const handleSelectCard = (name: CardName) => {
    setSelectedCard((prev) => (prev === name ? null : name));
  };

  const handlePointInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/,/g, '');
    const numValue = inputValue === '' ? 0 : Number(inputValue);
    if (
      discountedBase &&
      (inputValue === '' || (point >= numValue && numValue >= 0))
    ) {
      setValue(numValue);
    }
  };

  const handlePay = async () => {
    if (isPaying) return;
    setIsPaying(true);
    try {
      await createSelectedSeats(finalPrice);
      await updatePoint(point - pointValue + cardPayback);
      await saveStat(endStationForView);
      await createOrder({
        startStationForView,
        endStationForView,
        startDay,
        startDayForView,
        trainType: selectTrainType,
        selectAdult,
        selectKid,
        seatCount: seatsStateCount,
        finalPrice,
        paymentMethod: selectedPaymentMethod ?? '',
        selectedCard,
        isReturn: false,
      });
      closeModal('PayModal');
    } finally {
      setIsPaying(false);
    }
  };

  return {
    checked,
    value,
    eventSelected,
    handleEventChange,
    isDiscountEligible,
    basePrice,
    discountedBase,
    pointValue,
    cardDiscount,
    cardPayback,
    finalPrice,
    point,
    season,
    style,
    selectedPaymentMethod,
    selectedCard,
    selectedCardData,
    cardDiscountRate,
    cardPaybackRate,
    bannerText,
    paymentMethods: PAYMENT_METHODS,
    cardList: processedCardList,
    handleTogglePoint,
    handleUseAllPoint,
    handlePointInput,
    handleSelectPaymentMethod,
    handleSelectCard,
    handleClose,
    handlePay,
    isPaying,
  };
};
