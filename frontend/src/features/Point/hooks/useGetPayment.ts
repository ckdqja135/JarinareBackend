// @role: features — 포인트 적립 내역 조회
// @rule: api/ 호출만 담당, Firestore 직접 호출 금지
import { PaymentType } from '@/entities/Point/types/paymentType';
import { auth } from '@/shared/firebase/firebase';
import { backendClient } from '@/shared/api/backendClient';
import { useEffect, useState } from 'react';

type PointHistoryEntry = {
  id: string;
  accruedPoint: number;
  createAt: number;
  reason: string;
  referenceId?: string;
};

type PointHistoryResponse = {
  point: number;
  histories: PointHistoryEntry[];
  total: number;
  page: number;
  size: number;
};

export const useGetPayment = () => {
  const [payment, setPayment] = useState<PaymentType[]>([]);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    backendClient
      .get<PointHistoryResponse>('/api/users/me/point-history', {
        params: { size: 100 },
      })
      .then(({ data }) => {
        setPayment(
          data.histories.map((h) => ({
            accruedPoint: h.accruedPoint,
            createAt: h.createAt,
          })),
        );
      })
      .catch(() => {});
  }, [user?.uid]);

  return { payment };
};
