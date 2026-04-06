ALTER TABLE "Post" ADD COLUMN "captionTsv" tsvector;
CREATE INDEX post_caption_tsv_idx ON "Post" USING GIN ("captionTsv");