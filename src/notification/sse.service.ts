// @role: features/sse
// @rule: 유저별 SSE 연결 관리만 담당
import { Injectable } from "@nestjs/common";
import { Observable, Subject } from "rxjs";
import { finalize } from "rxjs/operators";

@Injectable()
export class SseService {
  private clients = new Map<number, Subject<MessageEvent>>();

  connect(userIdx: number): Observable<MessageEvent> {
    this.clients.get(userIdx)?.complete();

    const subject = new Subject<MessageEvent>();
    this.clients.set(userIdx, subject);

    return subject.asObservable().pipe(
      finalize(() => {
        this.clients.delete(userIdx);
      }),
    );
  }

  push(userIdx: number, data: object): void {
    this.clients.get(userIdx)?.next({ data: JSON.stringify(data) } as MessageEvent);
  }
}
