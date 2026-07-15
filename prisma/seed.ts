// 데모용 사용자 시드 스크립트.
// 실행: npm run prisma:seed  (또는 npx ts-node prisma/seed.ts)
//
// 생성된 Prisma 클라이언트는 ESM/CJS 확장자 처리 때문에 ts-node 로 직접 실행하기 번거로워
// 여기서는 mariadb 드라이버를 직접 사용한다. (bcrypt 해시는 앱과 동일)
import 'dotenv/config';
import * as bcrypt from 'bcryptjs';
import mariadb from 'mariadb';

const DEMO_USERS = [
  {
    username: 'admin',
    password: 'admin1234',
    name: '관리자',
    email: 'admin@example.com',
    age: 30,
  },
  {
    username: 'user',
    password: 'user1234',
    name: '사용자',
    email: 'user@example.com',
    age: 25,
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
      const password = await bcrypt.hash(u.password, 10);
      // username 이 이미 있으면 갱신하지 않고 그대로 둔다. (멱등)
      await conn.query(
        `INSERT INTO users (username, password, name, email, age, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, NOW(3), NOW(3))
         ON DUPLICATE KEY UPDATE username = username`,
        [u.username, password, u.name, u.email, u.age],
      );
      console.log(`seeded: ${u.username}`);
    }
  } finally {
    await conn.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
