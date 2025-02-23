set check_function_bodies = off;

CREATE OR REPLACE FUNCTION kit.get_storage_filename_as_uuid(name text)
 RETURNS uuid
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
begin
    return replace(storage.filename(name), concat('.',
                                                  storage.extension(name)), '')::uuid;

end;

$function$
;

CREATE OR REPLACE FUNCTION kit.handle_update_user_email()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
    update
        public.accounts
    set email = new.email
    where id = new.id;

    return new;

end;

$function$
;

CREATE OR REPLACE FUNCTION kit.new_user_created_setup()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
    user_name   text;
    picture_url text;
begin
    if new.raw_user_meta_data ->> 'name' is not null then
        user_name := new.raw_user_meta_data ->> 'name';

    end if;

    if user_name is null and new.email is not null then
        user_name := split_part(new.email, '@', 1);

    end if;

    if user_name is null then
        user_name := '';

    end if;

    if new.raw_user_meta_data ->> 'avatar_url' is not null then
        picture_url := new.raw_user_meta_data ->> 'avatar_url';
    else
        picture_url := null;
    end if;

    insert into public.accounts(id,
                                name,
                                picture_url,
                                email)
    values (new.id,
            user_name,
            picture_url,
            new.email);

    return new;

end;

$function$
;

CREATE OR REPLACE FUNCTION kit.protect_account_fields()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
begin
    if current_user in ('authenticated', 'anon') then
        if new.id <> old.id or new.email <> old.email then
            raise exception 'You do not have permission to update this field';

        end if;

    end if;

    return NEW;

end
$function$
;


alter table "public"."selected_accounts" drop constraint "selected_accounts_social_accounts_fkey";

alter table "public"."selected_accounts" add constraint "selected_accounts_social_accounts_fkey" FOREIGN KEY (social_accounts) REFERENCES social_accounts(id) ON DELETE CASCADE not valid;

alter table "public"."selected_accounts" validate constraint "selected_accounts_social_accounts_fkey";

create policy "Enable delete for users based on user_id"
on "public"."social_accounts"
as permissive
for delete
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "update only your own accs"
on "public"."social_accounts"
as permissive
for update
to public
using (( SELECT (auth.uid() = social_accounts.user_id)))
with check (( SELECT (auth.uid() = social_accounts.user_id)));



