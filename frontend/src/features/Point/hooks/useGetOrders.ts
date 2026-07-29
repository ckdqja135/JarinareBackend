/**
 * @role: features — 사용자 결제 내역 조회
 * @rule: 외부 데이터 호출만 담당
 */
import { backendClient } from '@/shared/api/backendClient';
import { useEffect, useState } from 'react';
import { OrderType } from '@/entities/Point/types/orderType';

type OrderResponse = OrderType & { id: string };

export const useGetOrders = () => {
  const [orders, setOrders] = useState<OrderType[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await backendClient.get<OrderResponse[]>('/api/orders/me');
        setOrders(res.data);
      } catch {
        // 조회 실패 시 빈 배열 유지
      }
    };

    fetchOrders();
  }, []);

  return { orders };
};
