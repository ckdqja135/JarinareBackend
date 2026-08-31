// 데모용 사용자 시드 스크립트.
// 실행: npm run prisma:seed  (또는 npx ts-node prisma/seed.ts)
//
// Firebase Auth 기반 스키마(users.uid = Firebase UID)에 맞춘 데모 데이터.
// 비밀번호는 Firebase 가 관리하므로 저장하지 않는다.
// 생성된 Prisma 클라이언트의 ESM/CJS 확장자 처리 때문에 여기서는 mariadb 드라이버를 직접 사용한다.
import 'dotenv/config';
import mariadb from 'mariadb';

// 데모 사용자. admin 계정은 관리자 권한(role='admin')을 가진다.
// uid 는 실제 환경에서는 Firebase Auth UID / Custom Claims 와 동기화한다.
const DEMO_USERS = [
  {
    uid: 'demo-admin-uid',
    userId: 'demo-admin-uid',
    name: '관리자',
    email: 'admin@example.com',
    age: '30',
    gender: 'male',
    role: 'admin',
  },
  {
    uid: 'demo-user-uid',
    userId: 'demo-user-uid',
    name: '사용자',
    email: 'user@example.com',
    age: '25',
    gender: 'female',
    role: 'user',
  },
];

async function main() {
  const conn = await mariadb.createConnection({
    host: process.env.RDB_HOST ?? 'localhost',
    port: Number(process.env.RDB_PORT ?? 3306),
    user: process.env.RDB_USERNAME ?? 'root',
    password: process.env.RDB_PASSWORD ?? '',
    database: process.env.RDB_DATABASE ?? 'test',
  });

  try {
    for (const u of DEMO_USERS) {
      // uid 가 이미 있으면 갱신하지 않는다. (멱등)
      await conn.query(
        `INSERT INTO users
           (uid, userId, name, email, age, gender, changeCount, point, \`change\`, response, role, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, 0, 0, 1, 1, ?, NOW(3), NOW(3))
         ON DUPLICATE KEY UPDATE uid = uid`,
        [u.uid, u.userId, u.name, u.email, u.age, u.gender, u.role],
      );
      console.log(`seeded: ${u.uid} (${u.role})`);
    }
  } finally {
    await conn.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
