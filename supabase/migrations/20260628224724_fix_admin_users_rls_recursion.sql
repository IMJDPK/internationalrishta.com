-- Fix infinite RLS recursion on admin_users SELECT
-- "Admins can view admin users" used id IN (SELECT id FROM admin_users) which re-triggers RLS → 500.
-- "User can view own admin row" (id = auth.uid()) is sufficient for dashboard + Navigation isAdmin checks.

DROP POLICY IF EXISTS "Admins can view admin users" ON public.admin_users;
