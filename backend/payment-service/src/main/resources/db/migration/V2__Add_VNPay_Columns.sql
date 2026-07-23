ALTER TABLE payments ADD COLUMN provider VARCHAR(50);
ALTER TABLE payments ADD COLUMN provider_txn_ref VARCHAR(255) UNIQUE;
ALTER TABLE payments ADD COLUMN provider_transaction_no VARCHAR(255);
ALTER TABLE payments ADD COLUMN paid_at TIMESTAMP;
