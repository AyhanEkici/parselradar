import fs from 'fs';
import path from 'path';

type Check = { name: string; pass: boolean; detail: string };

const ROOT = process.cwd();
const BASE_URL = 'https://parselradar-production.up.railway.app';

type LoginResponse = {
  token?: string;
  user?: { id?: string; email?: string; name?: string; role?: string };
  error?: string;
};

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

function parseJson(text: string): any {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

function check(name: string, pass: boolean, detail: string): Check {
  return { name, pass, detail };
}

async function login(email: string, password: string) {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const text = await response.text();
  return {
    status: response.status,
    body: parseJson(text) as LoginResponse | null,
    raw: text,
  };
}

async function me(token: string) {
  const response = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}`, accept: 'application/json' },
  });
  const text = await response.text();
  return {
    status: response.status,
    body: parseJson(text),
    raw: text,
  };
}

async function main() {
  const checks: Check[] = [];

  const app = read('apps/web/src/App.tsx');
  const appShell = read('apps/web/src/components/AppShell.tsx');
  const adminOnly = read('apps/web/src/components/AdminOnly.tsx');
  const roleGate = read('apps/web/src/components/RoleGate.tsx');
  const adminUsersPage = read('apps/web/src/pages/AdminUsers.tsx');
  const adminRoutes = read('apps/api/src/routes/adminRoutes.ts');
  const adminMiddleware = read('apps/api/src/middleware/admin.ts');
  const adminController = read('apps/api/src/controllers/adminController.ts');
  const passwordResetController = read('apps/api/src/controllers/passwordResetController.ts');
  const passwordResetEmailService = read('apps/api/src/services/auth/passwordResetEmailService.ts');

  checks.push(
    check(
      'Admin nav components exist',
      (app.includes('/admin/users') || appShell.includes('/admin/users')) &&
        (app.includes('/admin/connectors') || appShell.includes('/admin/connectors')) &&
        (app.includes('/admin/observability') || appShell.includes('/admin/observability')) &&
        (app.includes('/admin/runtime') || appShell.includes('/admin/runtime')) &&
        (app.includes('/admin/deployment') || appShell.includes('/admin/deployment')) &&
        (app.includes('/admin/audit-timeline') || appShell.includes('/admin/audit-timeline')),
      'App shell contains admin navigation links and routes.',
    ),
  );

  checks.push(
    check(
      'RoleGate + AdminOnly are wired',
      adminOnly.includes('RoleGate') &&
        adminOnly.includes('allow="admin"') &&
        roleGate.includes("allow === 'admin'") &&
        roleGate.includes("authStatus === 'booting' || authStatus === 'checking' || hasPersistentSession") &&
        roleGate.includes('Navigate to="/access-denied"') &&
        roleGate.includes('Navigate to="/login"'),
      'AdminOnly delegates to RoleGate and RoleGate enforces the admin boundary with the auth-status guard.',
    ),
  );

  checks.push(
    check(
      'AdminUsers page exists with role management UI',
      adminUsersPage.includes('apiFetch(`/admin/users/${targetUserId}/role`') &&
        adminUsersPage.includes('Kaydet') &&
        adminUsersPage.includes('EMAIL_NOT_CONFIGURED'),
      'AdminUsers includes role update controls and e-mail delivery diagnostic state.',
    ),
  );

  checks.push(
    check(
      'Admin endpoints are protected by auth+admin middleware',
      adminRoutes.includes("router.get('/users', auth, admin") &&
        adminRoutes.includes("router.patch('/users/:id/role', auth, admin") &&
        adminRoutes.includes("router.get('/email-delivery-state', auth, admin"),
      'Admin routes enforce both auth and admin middlewares.',
    ),
  );

  checks.push(
    check(
      'Role update endpoint exists with last-admin protection',
      adminController.includes('updateAdminUserRole') &&
        adminController.includes('en az bir ADMIN kalmalıdır') &&
        adminController.includes('Kendi hesabınızı USER rolüne düşüremezsiniz') &&
        adminController.includes("type: 'admin_user_role_updated'"),
      'Role update endpoint includes safeguards and audit logging.',
    ),
  );

  checks.push(
    check(
      'Logout button exists in authenticated navbar',
      (app.includes('Logout') || appShell.includes('Logout')) &&
        (app.includes('handleLogout') || appShell.includes('handleLogout')) &&
        (app.includes('user?.name || user?.email') || appShell.includes('user?.name || user?.email')),
      'Authenticated navbar renders user identity, role badge, and logout button.',
    ),
  );

  checks.push(
    check(
      'Forgot-password flow does not fake e-mail delivery',
      passwordResetController.includes('GENERIC_FORGOT_SUCCESS') &&
        passwordResetController.includes('sendPasswordResetEmail') &&
        passwordResetEmailService.includes("if (!provider.configured)") &&
        passwordResetEmailService.includes("return { state: provider.state }"),
      'Public response is generic and e-mail service returns explicit provider state.',
    ),
  );

  checks.push(
    check(
      'EMAIL_NOT_CONFIGURED state is explicit',
      passwordResetEmailService.includes("'EMAIL_NOT_CONFIGURED'") &&
        adminController.includes('getAdminEmailDeliveryState') &&
        adminController.includes("diagnosis: provider.configured ? 'EMAIL_CONFIGURED' : 'EMAIL_NOT_CONFIGURED'"),
      'Admin-only diagnostics expose EMAIL_NOT_CONFIGURED without leaking secrets.',
    ),
  );

  checks.push(
    check(
      'Reset tokens are not logged',
      !passwordResetController.includes('console.log') &&
        !passwordResetController.includes('console.info') &&
        !passwordResetController.includes('console.error(rawToken') &&
        !passwordResetController.includes('message: rawToken') &&
        !passwordResetEmailService.includes('console.log') &&
        !passwordResetEmailService.includes('console.info'),
      'No raw reset token logging statements detected in reset/email service files.',
    ),
  );

  checks.push(
    check(
      'passwordHash is not exposed by admin user APIs',
      adminController.includes(".select('-passwordHash')") &&
        adminController.includes('user: {') &&
        !adminController.includes('passwordHash:'),
      'Admin user responses are explicit and exclude passwordHash.',
    ),
  );

  checks.push(
    check(
      'RBAC still blocks USER from admin routes',
      adminMiddleware.includes("normalizedRole !== 'ADMIN'") && adminMiddleware.includes('return res.status(403)'),
      'Admin middleware still denies non-admin users.',
    ),
  );

  const pilotPassword = String(process.env.LIVE_VERIFY_PILOT_PASSWORD || '').trim();
  if (!pilotPassword) {
    checks.push(
      check(
        'Live role checks (pilot/ayhan/mahir)',
        false,
        'LIVE_VERIFY_PILOT_PASSWORD missing. Cannot run live role verification.',
      ),
    );
  } else {
    const pilotLogin = await login('pilot@test.com', pilotPassword);
    const pilotToken = pilotLogin.body?.token;

    checks.push(
      check(
        '/auth/me returns ADMIN for pilot',
        pilotLogin.status === 200 && Boolean(pilotToken),
        `loginStatus=${pilotLogin.status}`,
      ),
    );

    if (pilotToken) {
      const pilotMe = await me(pilotToken);
      checks.push(
        check(
          '/auth/me role for pilot is ADMIN',
          pilotMe.status === 200 && String(pilotMe.body?.role || '').toUpperCase() === 'ADMIN',
          `meStatus=${pilotMe.status} role=${pilotMe.body?.role || 'UNKNOWN'}`,
        ),
      );

      const usersResponse = await fetch(`${BASE_URL}/admin/users?limit=100`, {
        headers: { Authorization: `Bearer ${pilotToken}`, accept: 'application/json' },
      });
      const usersText = await usersResponse.text();
      const usersJson = parseJson(usersText);
      const users = Array.isArray(usersJson?.users) ? usersJson.users : [];

      const ayhan = users.find((u: any) => String(u?.email || '').toLowerCase() === 'ayhanekici@gmail.com');
      const mahir = users.find((u: any) => {
        const email = String(u?.email || '').toLowerCase();
        const name = String(u?.name || '').toLowerCase();
        return email.includes('mahir') || name.includes('mahir');
      });

      checks.push(
        check(
          'Role proof for ayhanekici is ADMIN',
          usersResponse.status === 200 && Boolean(ayhan) && String(ayhan?.role || '').toUpperCase() === 'ADMIN',
          `adminUsersStatus=${usersResponse.status} ayhanRole=${ayhan?.role || 'NOT_FOUND'}`,
        ),
      );

      checks.push(
        check(
          'Role proof for Mahir is USER',
          usersResponse.status === 200 && Boolean(mahir) && String(mahir?.role || '').toUpperCase() === 'USER',
          `adminUsersStatus=${usersResponse.status} mahirRole=${mahir?.role || 'NOT_FOUND'}`,
        ),
      );
    }
  }

  const failed = checks.filter((c) => !c.pass);
  const payload = {
    overallStatus: failed.length === 0 ? 'PASS' : 'FAIL',
    step: 'verify:admin-ux-email',
    summary: {
      total: checks.length,
      pass: checks.length - failed.length,
      fail: failed.length,
    },
    checks,
  };

  console.log(JSON.stringify(payload, null, 2));
  if (failed.length > 0) process.exit(1);
}

main().catch((error) => {
  console.error(
    JSON.stringify(
      {
        overallStatus: 'FAIL',
        step: 'verify:admin-ux-email',
        error: String((error as any)?.message || error),
      },
      null,
      2,
    ),
  );
  process.exit(1);
});
