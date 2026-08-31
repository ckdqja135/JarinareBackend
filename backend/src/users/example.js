const express = require('express');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

app.get('/users', async (req, res) => {
  try {
    // DB 연결
    await prisma.$connect();

    // 사용자 조회
    const users = await prisma.user.findMany({
      select: {
        userId: true,
        name: true,
        email: true,
        point: true,
        role: true,
      },
    });

    // 데이터 가공
    const formattedUsers = users.map((user) => ({
      id: user.userId,
      displayName: user.name,
      email: user.email,
      pointLabel: `${user.point}P`,
      role: user.role,
    }));

    // 권한 검사
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).send('로그인이 필요합니다.');
    }

    const currentUser = await prisma.user.findFirst({
      where: { email: 'admin@example.com' }, // 실제로는 JWT에서 email 추출
    });

    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).send('접근 권한이 없습니다.');
    }

    // HTML 생성
    const rows = formattedUsers
      .map(
        (user) =>
          `<tr>
            <td>${user.id}</td>
            <td>${user.displayName}</td>
            <td>${user.email}</td>
            <td>${user.pointLabel}</td>
            <td>${user.role}</td>
          </tr>`,
      )
      .join('');

    const html = `
      <!DOCTYPE html>
      <html>
        <head><title>사용자 목록</title></head>
        <body>
          <h1>사용자 목록</h1>
          <table border="1">
            <thead>
              <tr><th>ID</th><th>이름</th><th>이메일</th><th>포인트</th><th>역할</th></tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </body>
      </html>
    `;

    // 응답
    res.status(200).type('html').send(html);
  } catch (error) {
    console.error(error);
    res.status(500).send('서버 오류가 발생했습니다.');
  }
});

module.exports = app;
