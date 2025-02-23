create policy "public wcg0p1_0"
on "storage"."objects"
as permissive
for insert
to public
with check ((bucket_id = 'post_media'::text));


create policy "public wcg0p1_1"
on "storage"."objects"
as permissive
for select
to public
using ((bucket_id = 'post_media'::text));



