CREATE UNIQUE INDEX social_accounts_access_token_key ON public.social_accounts USING btree (access_token);

alter table "public"."social_accounts" add constraint "social_accounts_access_token_key" UNIQUE using index "social_accounts_access_token_key";


