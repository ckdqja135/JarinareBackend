-- age: VarChar → Int? (숫자만 저장)
-- gender: VarChar NOT NULL DEFAULT '' → VarChar NULL (male/female/null)

ALTER TABLE `users`
  MODIFY COLUMN `age` INTEGER NULL,
  MODIFY COLUMN `gender` VARCHAR(10) NULL;
