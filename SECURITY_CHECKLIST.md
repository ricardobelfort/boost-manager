# Checklist de Segurança - MVP Boost Manager

## Infra & Deploy
- [ ] HTTPS ativado SEMPRE
- [ ] Dependências atualizadas
- [ ] Chaves protegidas

## Supabase
- [ ] RLS habilitado
- [ ] Policies revisadas
- [ ] Backups automáticos

## Backend/API
- [ ] Não expor dados sensíveis
- [ ] Não retornar erros detalhados pro usuário
- [ ] Validação no backend

## Frontend
- [ ] Service_role protegida
- [ ] Headers de segurança (CSP, X-Frame-Options)
- [ ] Escapar outputs do usuário
- [ ] Feedback de erros/autorização

## Autenticação
- [ ] Lockout após X tentativas
- [ ] Tokens com expiração curta
- [ ] Logout apaga sessão

## Políticas & Cookies
- [ ] Consentimento de cookies
- [✅] Página de Política de Privacidade
- [✅] Página de Termos de Uso

## Logs & Monitoramento
- [ ] Logs de erro/acesso no Supabase
- [ ] Alerta em caso de erro

## Backups
- [ ] Confirmar backups ativos

---
