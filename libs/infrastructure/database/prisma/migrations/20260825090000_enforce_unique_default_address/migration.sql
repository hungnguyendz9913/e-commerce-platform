-- Keep the most recently updated default if legacy data contains duplicates.
WITH "ranked_defaults" AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (
      PARTITION BY "user_id"
      ORDER BY "updated_at" DESC, "id" DESC
    ) AS "default_rank"
  FROM "addresses"
  WHERE "is_default" = true
)
UPDATE "addresses"
SET "is_default" = false
FROM "ranked_defaults"
WHERE "addresses"."id" = "ranked_defaults"."id"
  AND "ranked_defaults"."default_rank" > 1;

CREATE UNIQUE INDEX "unique_default_address_per_user"
ON "addresses" ("user_id")
WHERE "is_default" = true;
