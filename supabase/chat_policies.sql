-- Chat entre cliente y acompañante (tabla service_messages de la migración 0004).
-- Ejecutar en el SQL Editor de Supabase. REVISAR antes de usar en producción.
alter table public.service_messages enable row level security;

drop policy if exists msg_select on public.service_messages;
create policy msg_select on public.service_messages for select to authenticated using (
  exists (select 1 from public.service_requests s
          where s.id = service_messages.service_request_id
            and auth.uid() in (s.customer_id, s.client_id, s.user_id, s.companion_id))
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('ADMIN','OPERATOR','AUDITOR'))
);

drop policy if exists msg_insert on public.service_messages;
create policy msg_insert on public.service_messages for insert to authenticated with check (
  sender_id = auth.uid()
  and exists (select 1 from public.service_requests s
              where s.id = service_messages.service_request_id
                and auth.uid() in (s.customer_id, s.client_id, s.user_id, s.companion_id))
);

-- Mensajes en tiempo real (si da error "already member", ya estaba activado):
alter publication supabase_realtime add table public.service_messages;
