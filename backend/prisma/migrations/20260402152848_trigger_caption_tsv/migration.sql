CREATE OR REPLACE FUNCTION update_post_caption_tsv() RETURNS trigger AS $$
BEGIN
  NEW."captionTsv" := to_tsvector('pg_catalog.english', coalesce(NEW.caption, ''));
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER caption_tsv_update
BEFORE INSERT OR UPDATE ON "Post"
FOR EACH ROW
EXECUTE Procedure update_post_caption_tsv();
