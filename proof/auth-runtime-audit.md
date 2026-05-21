# AUTH RUNTIME AUDIT

Overall status: FAIL

Failing auth defects:
- pilot real login remains on /login after success toast
- parselradar_token and parselradar_user are cleared immediately after login
- Ctrl+F5/reload does not preserve authenticated session
- back/forward does not keep authenticated app shell
- admin route clicks fall back to /login due to collapsed auth state

Blockers:
- Ayhan real browser login credential not available in-session
- Mahir real browser login credential not available in-session

Evidence:
- pilot after-login URL: /login
- pilot storage: token=false user=false
- pilot after-reload URL: /login
- ayhan attempt result: Şifre hatalı
- mahir attempt result: Şifre hatalı
