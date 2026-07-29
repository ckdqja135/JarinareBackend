/**
 * @role: pages — 마이페이지 필터 상태·파생값 관리
 * @rule: 상태·사이드이펙트·이벤트 핸들러만 담당
 */
import { useState } from 'react';
import { OrderType } from '@/entities/Point/types/orderType';
import { PaymentType } from '@/entities/Point/types/paymentType';
import { PeriodFilter, TypeFilter, PointTypeFilter, SortOrder } from '../types/myPageTypes';
import { PERIOD_MONTHS } from '../constants/myPageConstants';

export const useMyPageFilter = (orders: OrderType[], pointHistory: PaymentType[]) => {
  const [period, setPeriod] = useState<PeriodFilter>('1개월');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('전체');
  const [sortOrder, setSortOrder] = useState<SortOrder>('최신순');
  const [pointPeriod, setPointPeriod] = useState<PeriodFilter>('1개월');
  const [pointTypeFilter, setPointTypeFilter] = useState<PointTypeFilter>('전체');
  const [pointSortOrder, setPointSortOrder] = useState<SortOrder>('최신순');

  const cutoff = Date.now() / 1000 - PERIOD_MONTHS[period] * 30 * 24 * 60 * 60;
  const filteredOrders = orders
    .filter((o) => o.createAt >= cutoff)
    .filter((o) => typeFilter === '전체' || (typeFilter === '반환' ? o.isReturn : !o.isReturn))
    .sort((a, b) => sortOrder === '최신순' ? b.createAt - a.createAt : a.createAt - b.createAt);

  const pointCutoff = Date.now() / 1000 - PERIOD_MONTHS[pointPeriod] * 30 * 24 * 60 * 60;
  const filteredPoints = pointHistory
    .filter((p) => p.createAt >= pointCutoff)
    .filter((p) => pointTypeFilter === '전체' || (pointTypeFilter === '적립' ? p.accruedPoint > 0 : p.accruedPoint < 0))
    .sort((a, b) => pointSortOrder === '최신순' ? b.createAt - a.createAt : a.createAt - b.createAt);

  return {
    period, setPeriod,
    typeFilter, setTypeFilter,
    sortOrder, setSortOrder,
    pointPeriod, setPointPeriod,
    pointTypeFilter, setPointTypeFilter,
    pointSortOrder, setPointSortOrder,
    filteredOrders,
    filteredPoints,
  };
};
