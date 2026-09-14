type Db = {
  prepare: (query: string) => {
    bind: (...values: unknown[]) => {
      first: <T>() => Promise<T | null>;
      run: () => Promise<unknown>;
    };
    first: <T>() => Promise<T | null>;
  };
};
export async function accessDigest(value: string) {
  const bytes = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(value),
  );
  return [...new Uint8Array(bytes)]
    .map((x) => x.toString(16).padStart(2, '0'))
    .join('');
}
export async function hasFamilyAccess(request: Request) {
  const secret = process.env.FAMILY_ACCESS_CODE;
  if (!secret) return false;
  const cookie = request.headers
    .get('cookie')
    ?.match(/(?:^|; )rota_access=([^;]+)/)?.[1];
  return Boolean(cookie && cookie === (await accessDigest(secret)));
}
export async function requireMember(request: Request, db: Db, roles: string[]) {
  let userId = request.headers.get('oai-authenticated-user-id'),
    email = request.headers.get('oai-authenticated-user-email');
  if (!userId || !email) {
    if (!(await hasFamilyAccess(request)))
      throw new Response('Giriş gerekli', { status: 401 });
    userId = 'family-access';
    email = 'family@local';
  }
  if (userId === 'family-access')
    return {
      userId,
      email,
      role: roles.includes('guardian') ? 'guardian' : roles[0],
      subjectId: null,
    };
  let member = await db
    .prepare(
      'SELECT role, subject_id as subjectId FROM members WHERE user_id = ?',
    )
    .bind(userId)
    .first<{ role: string; subjectId: string | null }>();
  if (!member) {
    const count = await db
      .prepare('SELECT COUNT(*) as count FROM members')
      .first<{ count: number }>();
    if (Number(count?.count ?? 0) !== 0)
      throw new Response('Bu hesap henüz davet edilmemiş', { status: 403 });
    await db
      .prepare(
        'INSERT INTO members (user_id, email, role, created_at) VALUES (?, ?, ?, ?)',
      )
      .bind(userId, email, 'guardian', new Date().toISOString())
      .run();
    member = { role: 'guardian', subjectId: null };
  }
  if (!roles.includes(member.role))
    throw new Response('Bu işlem için yetkiniz yok', { status: 403 });
  return { userId, email, ...member };
}

export function requireAdmin(request: Request) {
  const userId = request.headers.get('oai-authenticated-user-id');
  const email = request.headers.get('oai-authenticated-user-email');
  const adminUserId = process.env.ADMIN_USER_ID;
  if (!userId || !email)
    throw new Response('Yönetici girişi gerekli', { status: 401 });
  if (!adminUserId || userId !== adminUserId)
    throw new Response('Bu hesap yönetici değil', { status: 403 });
  return { userId, email, role: 'admin' as const };
}
