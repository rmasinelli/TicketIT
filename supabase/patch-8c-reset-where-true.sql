-- Patch 8c: Supabase blocks DELETE with no WHERE even inside functions
-- Add WHERE true to satisfy the requirement

create or replace function admin_reset_assigned_tickets()
returns void language plpgsql security definer
set row_security = off
as $$
begin
  if not is_admin() then
    raise exception 'not authorized';
  end if;
  delete from lab_notes        where true;
  delete from assigned_tickets where true;
  delete from lab_assignments  where true;
end;
$$;

grant execute on function admin_reset_assigned_tickets() to authenticated;
