/**
 * @role: pages — PC 마이페이지
 * @rule: 레이아웃·조합만 담당, 비즈니스 로직 포함 금지
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PCTopNav from '@/widgets/layouts/ui/PCTopNav';
import PCSidebar from '@/widgets/layouts/ui/PCSidebar';
import PCLoginRequiredPage from '@/widgets/layouts/ui/PCLoginRequiredPage';
import SlotNumber from '@/widgets/Point/ui/SlotNumber';
import { useGetPoint } from '@/features/Point/hooks/useGetPoint';
import { useFollowList } from '@/features/Follow/hooks/useFollowList';
import { useGetPayment } from '@/features/Point/hooks/useGetPayment';
import { useGetOrders } from '@/features/Point/hooks/useGetOrders';
import { ACCESS_TOKEN_KEY, backendClient } from '@/shared/api/backendClient';
import { useCurrentUser } from '@/features/Auth/hooks/useCurrentUser';
import { getProfileColor } from '@/shared/lib/profileColor';
import {
  formatMonthDay,
  formatStartDate,
  formatDateForView,
} from '@/shared/lib/formatDate';
import { useNaviation } from '../hooks/useNavigation';
import useModalStore from '@/widgets/model/AuthStore';
import { OrderType } from '@/entities/Point/types/orderType';
import { PaymentType } from '@/entities/Point/types/paymentType';
import { FilterTab } from '../types/myPageTypes';
import {
  PERIOD_OPTIONS,
  TYPE_OPTIONS,
  POINT_TYPE_OPTIONS,
  SORT_OPTIONS,
} from '../constants/myPageConstants';
import { useMyPageFilter } from '../hooks/useMyPageFilter';
import { useMyPageModal } from '../hooks/useMyPageModal';
import PCFollowModal from '@/widgets/Follow/ui/PCFollowModal';

const PCMyPage = () => {
  const { point } = useGetPoint();
  const { navigate } = useNaviation();
  const { resetModal } = useModalStore();
  const { followers, following, counts } = useFollowList();
  const { payment: pointHistory } = useGetPayment();
  const { orders } = useGetOrders();
  const routerNavigate = useNavigate();
  const { user: userData, isLoading: userLoading } = useCurrentUser();

  const [activeTab, setActiveTab] = useState<FilterTab>('payment');
  const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<PaymentType | null>(null);
  const { followModalOpen, followModalTab, openFollowModal, closeFollowModal } = useMyPageModal();

  const {
    period,
    setPeriod,
    typeFilter,
    setTypeFilter,
    sortOrder,
    setSortOrder,
    pointPeriod,
    setPointPeriod,
    pointTypeFilter,
    setPointTypeFilter,
    pointSortOrder,
    setPointSortOrder,
    filteredOrders,
    filteredPoints,
  } = useMyPageFilter(orders, pointHistory);

  if (!localStorage.getItem(ACCESS_TOKEN_KEY)) {
    return (
      <PCLoginRequiredPage
        description="로그인 후 마이페이지를 이용할 수 있어요"
        onLogin={() => routerNavigate('/auth/login')}
      />
    );
  }

  if (userLoading || !userData) return null;

  const displayName = userData.name || userData.userId;
  const initial = displayName.charAt(0).toUpperCase();
  const providerBadge = null;

  const handleLogout = async () => {
    await backendClient.post('/oauth/logout').catch(() => {});
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    resetModal();
    navigate('/');
  };

  const handleTabChange = (tab: FilterTab) => {
    setActiveTab(tab);
    setSelectedOrder(null);
    setSelectedPoint(null);
  };

  const handleSelectOrder = (order: OrderType) => {
    setSelectedOrder(order);
    setSelectedPoint(null);
  };

  const handleSelectPoint = (item: PaymentType) => {
    setSelectedPoint(item);
    setSelectedOrder(null);
  };

  return (
    <>
    <div className="flex min-h-screen w-full flex-col bg-gray-50">
      <PCTopNav />

      <div className="flex w-full flex-1 gap-0">
        <PCSidebar />

        <main
          className="relative min-w-0 flex-1 overflow-y-auto overflow-x-hidden"
          style={{ height: 'calc(100vh - 3.5rem)' }}
        >
          <div className="px-64 pb-16 pt-10">
            <h1 className="mb-6 text-2xl font-black text-gray-900">
              마이페이지
            </h1>

            {/* 1행: 내 정보 4fr + 포인트 1.5fr */}
            <div className="grid grid-cols-[4fr_1.5fr] gap-4">
              {/* 내 정보 카드 */}
              <div className="flex items-center gap-8 rounded-2xl bg-white px-8 py-6 shadow-sm">
                <div className="relative shrink-0">
                  <div
                    className="flex h-20 w-20 items-center justify-center rounded-2xl text-2xl font-black text-white shadow-sm"
                    style={{ backgroundColor: getProfileColor(displayName) }}
                  >
                    {initial}
                  </div>
                  {providerBadge ? (
                    <div
                      className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full shadow-md"
                      style={{ backgroundColor: providerBadge.bg }}
                    >
                      <img
                        src={providerBadge.icon}
                        alt={providerBadge.label}
                        className="h-4 w-4 object-contain"
                      />
                    </div>
                  ) : (
                    <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 shadow-md">
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#6b7280"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-xl font-black text-gray-900">
                    {displayName}
                  </span>
                  <span className="text-sm text-gray-400">
                    {providerBadge
                      ? `${providerBadge.label} 계정`
                      : '일반 계정'}
                  </span>
                </div>

                <div className="mx-2 h-12 w-px self-center bg-gray-100" />

                <button
                  onClick={() => openFollowModal('followers')}
                  className="flex flex-col items-center gap-0.5 transition-opacity hover:opacity-70"
                >
                  <span className="text-2xl font-semibold text-gray-900">
                    {counts.followers}
                  </span>
                  <span className="text-xs text-gray-400">팔로워</span>
                </button>

                <div className="h-12 w-px self-center bg-gray-100" />

                <button
                  onClick={() => openFollowModal('following')}
                  className="flex flex-col items-center gap-0.5 transition-opacity hover:opacity-70"
                >
                  <span className="text-2xl font-semibold text-gray-900">
                    {counts.following}
                  </span>
                  <span className="text-xs text-gray-400">팔로잉</span>
                </button>

                <div className="ml-auto">
                  <button
                    onClick={handleLogout}
                    className="rounded-xl border border-red/20 bg-red/5 px-5 py-2.5 text-sm font-bold text-red transition-colors hover:bg-red/10"
                  >
                    로그아웃
                  </button>
                </div>
              </div>

              {/* 포인트 카드 */}
              <div className="flex flex-col justify-between rounded-2xl bg-blue p-6 shadow-sm">
                <div className="text-sm font-medium text-white/70">
                  내 포인트
                </div>
                <div className="mt-3">
                  <SlotNumber
                    value={point}
                    className="text-3xl font-semibold text-white"
                  />
                </div>
              </div>
            </div>

            {/* 2행: 거래내역 카드 */}
            <div className="mt-4 rounded-2xl bg-white p-6 shadow-sm">
              {/* 제목 토글 */}
              <div className="mb-4 flex items-center gap-6">
                <button
                  onClick={() => handleTabChange('payment')}
                  className={`text-lg font-black transition-colors ${
                    activeTab === 'payment'
                      ? 'text-gray-900'
                      : 'text-gray-300 hover:text-gray-500'
                  }`}
                >
                  결제 내역
                </button>
                <button
                  onClick={() => handleTabChange('point')}
                  className={`text-lg font-black transition-colors ${
                    activeTab === 'point'
                      ? 'text-gray-900'
                      : 'text-gray-300 hover:text-gray-500'
                  }`}
                >
                  포인트 내역
                </button>
              </div>

              <div className="grid grid-cols-[1fr_2fr] gap-4">
                {/* 좌측: 리스트 */}
                <div className="flex flex-col gap-2">
                  {/* 드롭다운 필터 */}
                  {activeTab === 'payment' && (
                    <div className="flex items-center gap-2">
                      {[
                        {
                          value: period,
                          onChange: (v: string) =>
                            setPeriod(v as typeof period),
                          options: PERIOD_OPTIONS,
                        },
                        {
                          value: typeFilter,
                          onChange: (v: string) =>
                            setTypeFilter(v as typeof typeFilter),
                          options: TYPE_OPTIONS,
                        },
                        {
                          value: sortOrder,
                          onChange: (v: string) =>
                            setSortOrder(v as typeof sortOrder),
                          options: SORT_OPTIONS,
                        },
                      ].map((item, i) => (
                        <div key={i} className="relative flex-1">
                          <select
                            value={item.value}
                            onChange={(e) => item.onChange(e.target.value)}
                            className="w-full appearance-none rounded-sm border border-gray-200 bg-white py-2.5 pl-2 pr-7 text-xs font-semibold text-gray-400 outline-none"
                          >
                            {item.options.map((opt) => (
                              <option key={opt}>{opt}</option>
                            ))}
                          </select>
                          <svg
                            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'point' && (
                    <div className="flex items-center gap-2">
                      {[
                        {
                          value: pointPeriod,
                          onChange: (v: string) =>
                            setPointPeriod(v as typeof pointPeriod),
                          options: PERIOD_OPTIONS,
                        },
                        {
                          value: pointTypeFilter,
                          onChange: (v: string) =>
                            setPointTypeFilter(v as typeof pointTypeFilter),
                          options: POINT_TYPE_OPTIONS,
                        },
                        {
                          value: pointSortOrder,
                          onChange: (v: string) =>
                            setPointSortOrder(v as typeof pointSortOrder),
                          options: SORT_OPTIONS,
                        },
                      ].map((item, i) => (
                        <div key={i} className="relative flex-1">
                          <select
                            value={item.value}
                            onChange={(e) => item.onChange(e.target.value)}
                            className="w-full appearance-none rounded-sm border border-gray-200 bg-white py-2.5 pl-2 pr-7 text-xs font-semibold text-gray-400 outline-none"
                          >
                            {item.options.map((opt) => (
                              <option key={opt}>{opt}</option>
                            ))}
                          </select>
                          <svg
                            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 리스트 카드 */}
                  <div className="flex flex-col overflow-hidden rounded-xl bg-gray-50">
                    {/* 리스트 */}
                    <div
                      className="flex flex-col overflow-y-auto"
                      style={{ maxHeight: '400px' }}
                    >
                      {activeTab === 'payment' &&
                        (filteredOrders.length === 0 ? (
                          <div className="flex flex-1 flex-col items-center justify-center py-16 text-sm text-gray-300">
                            결제 내역이 없습니다
                          </div>
                        ) : (
                          filteredOrders.map((order) => {
                            const isSelected =
                              selectedOrder?.createAt === order.createAt;
                            return (
                              <button
                                key={order.createAt}
                                onClick={() => handleSelectOrder(order)}
                                className={`flex items-center justify-between border-b border-gray-50 px-5 py-4 text-left transition-colors last:border-0 ${
                                  isSelected ? 'bg-blue/5' : 'hover:bg-gray-50'
                                }`}
                              >
                                <div className="flex flex-col gap-0.5">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-sm font-bold text-gray-800">
                                      {order.startStationForView} →{' '}
                                      {order.endStationForView}
                                    </span>
                                    {order.isReturn && (
                                      <span className="rounded bg-red/10 px-1.5 py-0.5 text-[10px] font-bold text-red">
                                        반환
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-xs text-gray-400">
                                    {formatDateForView(
                                      formatStartDate(order.startDay),
                                    )}
                                  </span>
                                </div>
                                <span
                                  className={`text-sm font-semibold ${order.isReturn ? 'text-red' : 'text-blue'}`}
                                >
                                  {order.isReturn ? '-' : ''}
                                  {Number(order.finalPrice).toLocaleString(
                                    'ko-KR',
                                  )}
                                  원
                                </span>
                              </button>
                            );
                          })
                        ))}

                      {activeTab === 'point' &&
                        (filteredPoints.length === 0 ? (
                          <div className="flex flex-1 flex-col items-center justify-center py-16 text-sm text-gray-300">
                            포인트 적립 내역이 없습니다
                          </div>
                        ) : (
                          filteredPoints.map((item) => {
                            const isSelected =
                              selectedPoint?.createAt === item.createAt;
                            return (
                              <button
                                key={item.createAt}
                                onClick={() => handleSelectPoint(item)}
                                className={`flex items-center justify-between border-b border-gray-50 px-5 py-4 text-left transition-colors last:border-0 ${
                                  isSelected ? 'bg-blue/5' : 'hover:bg-gray-50'
                                }`}
                              >
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-sm font-bold text-gray-800">
                                    {item.accruedPoint > 0
                                      ? '포인트 적립'
                                      : '포인트 사용'}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    {formatMonthDay(item.createAt)}
                                  </span>
                                </div>
                                <span
                                  className={`text-sm font-semibold ${item.accruedPoint > 0 ? 'text-blue' : 'text-red'}`}
                                >
                                  {item.accruedPoint > 0 ? '+' : ''}
                                  {Number(item.accruedPoint).toLocaleString(
                                    'ko-KR',
                                  )}
                                  P
                                </span>
                              </button>
                            );
                          })
                        ))}
                    </div>
                  </div>
                </div>

                {/* 우측: 세부 내역 */}
                <div className="flex flex-col rounded-xl bg-gray-50">
                  {!selectedOrder && !selectedPoint && (
                    <div className="flex flex-1 flex-col items-center justify-center py-20 text-sm text-gray-300">
                      항목을 선택하면 세부 내역이 표시됩니다
                    </div>
                  )}

                  {/* 결제 세부 내역 */}
                  {selectedOrder && (
                    <div className="flex flex-col gap-0 divide-y divide-gray-50">
                      <div className="px-7 py-5">
                        <div className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                          {selectedOrder.isReturn ? '반환 내역' : '결제 내역'}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col gap-1">
                            <span className="text-lg font-black text-gray-900">
                              {selectedOrder.startStationForView} →{' '}
                              {selectedOrder.endStationForView}
                            </span>
                            <span className="text-sm text-gray-400">
                              {formatDateForView(
                                formatStartDate(selectedOrder.startDay),
                              )}
                            </span>
                          </div>
                          <span className="rounded-lg bg-blue/10 px-3 py-1.5 text-sm font-bold text-blue">
                            {selectedOrder.trainType}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-px bg-gray-50">
                        <div className="flex flex-col gap-1 bg-white px-7 py-4">
                          <span className="text-xs text-gray-400">인원</span>
                          <span className="text-sm font-semibold text-gray-800">
                            어른 {selectedOrder.selectAdult}명
                            {selectedOrder.selectKid > 0 &&
                              ` · 어린이 ${selectedOrder.selectKid}명`}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1 bg-white px-7 py-4">
                          <span className="text-xs text-gray-400">좌석 수</span>
                          <span className="text-sm font-semibold text-gray-800">
                            {selectedOrder.seatCount}석
                          </span>
                        </div>
                        <div className="flex flex-col gap-1 bg-white px-7 py-4">
                          <span className="text-xs text-gray-400">
                            결제 수단
                          </span>
                          <span className="text-sm font-semibold text-gray-800">
                            {selectedOrder.paymentMethod}
                            {selectedOrder.selectedCard &&
                              ` · ${selectedOrder.selectedCard}`}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between px-7 py-5">
                        <span className="text-sm font-semibold text-gray-700">
                          {selectedOrder.isReturn
                            ? '반환 금액'
                            : '총 결제 금액'}
                        </span>
                        <span
                          className={`text-xl font-black ${selectedOrder.isReturn ? 'text-red' : 'text-gray-900'}`}
                        >
                          {selectedOrder.isReturn ? '-' : ''}
                          {Number(selectedOrder.finalPrice).toLocaleString(
                            'ko-KR',
                          )}
                          원
                        </span>
                      </div>
                    </div>
                  )}

                  {/* 포인트 세부 내역 */}
                  {selectedPoint && (
                    <div className="flex flex-col gap-0 divide-y divide-gray-50">
                      <div className="px-7 py-5">
                        <div className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                          {selectedPoint.accruedPoint > 0
                            ? '포인트 적립 내역'
                            : '포인트 사용 내역'}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col gap-1">
                            <span className="text-lg font-black text-gray-900">
                              {selectedPoint.accruedPoint > 0
                                ? '포인트 적립'
                                : '포인트 사용'}
                            </span>
                            <span className="text-sm text-gray-400">
                              {formatMonthDay(selectedPoint.createAt)} ·
                              자리나레
                            </span>
                          </div>
                          <div className="flex flex-col items-end gap-0.5">
                            <span
                              className={`text-xl font-black ${selectedPoint.accruedPoint > 0 ? 'text-blue' : 'text-red'}`}
                            >
                              {selectedPoint.accruedPoint > 0 ? '+' : ''}
                              {Number(
                                selectedPoint.accruedPoint,
                              ).toLocaleString('ko-KR')}
                              P
                            </span>
                            <span className="text-xs text-gray-400">
                              {selectedPoint.accruedPoint > 0
                                ? '적립 포인트'
                                : '사용 포인트'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="px-7 py-5">
                        <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                          <span className="text-sm text-gray-600">
                            적립 일시
                          </span>
                          <span className="text-sm font-semibold text-gray-800">
                            {new Date(
                              selectedPoint.createAt * 1000,
                            ).toLocaleString('ko-KR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {followModalOpen && (
            <PCFollowModal
              followers={followers}
              following={following}
              counts={counts}
              initialTab={followModalTab}
              onClose={closeFollowModal}
            />
          )}
        </main>
      </div>
    </div>
    </>
  );

};

export default PCMyPage;
