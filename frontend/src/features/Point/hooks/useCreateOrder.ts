/**
 * @role: features — 결제 완료 시 주문 내역 저장
 * @rule: 외부 데이터 호출만 담당
 */
import { backendClient } from '@/shared/api/backendClient';
import { OrderType } from '@/entities/Point/types/orderType';

export const useCreateOrder = () => {
  const createOrder = async (order: Omit<OrderType, 'createAt'>) => {
    await backendClient.post('/api/orders', order);
  };

  return { createOrder };
};
