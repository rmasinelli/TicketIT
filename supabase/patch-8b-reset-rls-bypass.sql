-- Patch 8b: fix admin_reset_assigned_tickets to bypass RLS

-- security definer alone doesn't bypass RLS — need SET row_security = off
create or replace function admin_reset_assigned_tickets()
returns void language plpgsql security definer
set row_security = off
as $$
begin
  if not is_admin() then
    raise exception 'not authorized';
  end if;
  delete from lab_notes;
  delete from assigned_tickets;
  delete from lab_assignments;
end;
$$;

grant execute on function admin_reset_assigned_tickets() to authenticated;
