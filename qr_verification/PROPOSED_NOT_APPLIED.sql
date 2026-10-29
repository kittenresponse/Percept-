alter table percept_internal.document_registry add column if not exists is_test boolean not null default false;
alter table percept_internal.document_registry add column if not exists expires_on date;
alter table public.percept_public_verifications add column if not exists file_sha256 text;
alter table public.percept_public_verifications add column if not exists is_test boolean not null default false;
alter table public.percept_public_verifications add column if not exists expires_on date;
alter table public.percept_public_verifications add column if not exists updated_at timestamptz not null default now();

create or replace function percept_internal.sync_public_verification() returns trigger
language plpgsql set search_path = '' as $$
begin
 if TG_OP = 'DELETE' then
  delete from public.percept_public_verifications where verification_token=OLD.verification_token;
  return OLD;
 end if;
 if TG_OP='UPDATE' and OLD.verification_token<>NEW.verification_token then
  delete from public.percept_public_verifications where verification_token=OLD.verification_token;
 end if;
 if NEW.approved_for_publication then
  insert into public.percept_public_verifications(verification_token,document_reference,document_type,title_public,issuer_public,issued_on,status,file_sha256,is_test,expires_on,updated_at)
  values(NEW.verification_token,NEW.document_reference,NEW.document_type,NEW.title_public,NEW.issuer_public,NEW.issued_on,NEW.status,NEW.file_sha256,NEW.is_test,NEW.expires_on,now())
  on conflict(verification_token) do update set document_reference=excluded.document_reference,document_type=excluded.document_type,title_public=excluded.title_public,issuer_public=excluded.issuer_public,issued_on=excluded.issued_on,status=excluded.status,file_sha256=excluded.file_sha256,is_test=excluded.is_test,expires_on=excluded.expires_on,updated_at=excluded.updated_at;
 else
  delete from public.percept_public_verifications where verification_token=NEW.verification_token;
 end if;
 return NEW;
end $$;
revoke all on function percept_internal.sync_public_verification() from public,anon,authenticated;

create or replace function percept_internal.audit_document_change() returns trigger
language plpgsql set search_path='' as $$
begin
 if TG_OP='UPDATE' and OLD.status='verified' and
  (NEW.file_sha256<>OLD.file_sha256 or NEW.verification_token<>OLD.verification_token or NEW.document_reference<>OLD.document_reference) then
  raise exception 'Verified identity and file fingerprint are immutable; register a new version';
 end if;
 NEW.updated_at=now();
 return NEW;
end $$;
revoke all on function percept_internal.audit_document_change() from public,anon,authenticated;
drop trigger if exists protect_verified_document_identity on percept_internal.document_registry;
create trigger protect_verified_document_identity before update on percept_internal.document_registry for each row execute function percept_internal.audit_document_change();

create or replace function percept_internal.log_document_change() returns trigger
language plpgsql set search_path='' as $$
begin
 insert into percept_internal.document_audit(document_id,action,actor,notes)
 values(NEW.id,TG_OP,current_user,json_build_object('reference',NEW.document_reference,'status',NEW.status,'published',NEW.approved_for_publication,'sha256',NEW.file_sha256,'is_test',NEW.is_test)::text);
 return NEW;
end $$;
revoke all on function percept_internal.log_document_change() from public,anon,authenticated;
drop trigger if exists log_percept_document_change on percept_internal.document_registry;
create trigger log_percept_document_change after insert or update on percept_internal.document_registry for each row execute function percept_internal.log_document_change();

revoke all on public.percept_public_verifications from anon,authenticated;
grant select on public.percept_public_verifications to service_role;
alter table public.percept_public_verifications enable row level security;
update percept_internal.document_registry set is_test=true
 where verification_token='18aed8e7-4a12-4122-962b-467b9a4ad3cf' and document_type='Verification system test';
