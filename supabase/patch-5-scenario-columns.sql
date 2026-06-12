-- Patch 5: add course/week/mode columns to ticket_templates
alter table ticket_templates add column if not exists course_id text;
alter table ticket_templates add column if not exists week      int;
alter table ticket_templates add column if not exists mode      text default 'broadcast';

-- Allow authenticated users to read templates
drop policy if exists "templates: read all" on ticket_templates;
create policy "templates: read all"
  on ticket_templates for select
  using (auth.role() = 'authenticated');

drop policy if exists "templates: admin write" on ticket_templates;
create policy "templates: admin insert" on ticket_templates for insert with check (is_admin());
create policy "templates: admin update" on ticket_templates for update using (is_admin());
create policy "templates: admin delete" on ticket_templates for delete using (is_admin());
