-- Patch 4: fix admin insert policies and add unique constraint for lab notes upsert

-- Unique constraint so lab_notes can be upserted
alter table lab_notes add constraint lab_notes_ticket_student_unique
  unique (assigned_ticket_id, student_id);

-- Rebuild assigned_tickets policies with explicit insert check
drop policy if exists "assigned_tickets: admin all" on assigned_tickets;

create policy "assigned_tickets: admin insert"
  on assigned_tickets for insert
  with check (is_admin());

create policy "assigned_tickets: admin select"
  on assigned_tickets for select
  using (is_admin());

create policy "assigned_tickets: admin update"
  on assigned_tickets for update
  using (is_admin());

-- Rebuild lab_assignments policies
drop policy if exists "assignments: admin write" on lab_assignments;

create policy "assignments: admin insert"
  on lab_assignments for insert
  with check (is_admin());

create policy "assignments: admin select"
  on lab_assignments for select
  using (is_admin());

-- Students can read assignments for their class
drop policy if exists "assignments: student read" on lab_assignments;
create policy "assignments: student read"
  on lab_assignments for select
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and class_id = lab_assignments.class_id
    )
  );
