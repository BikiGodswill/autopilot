-- ============================================================================
-- SEO Autopilot — add a dedicated notification type for plan upgrades
-- Run after 0002_billing_fapshi.sql.
-- ============================================================================

alter table notifications drop constraint notifications_type_check;

alter table notifications add constraint notifications_type_check
  check (type in (
    'audit_completed',
    'issue_detected',
    'score_changed',
    'keyword_opportunity',
    'content_generated',
    'optimization_completed',
    'integration_error',
    'plan_upgraded'
  ));
