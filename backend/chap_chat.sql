-- Drop and recreate the main database
\echo 'Delete and recreate chap_chat database?'
\prompt 'Press Enter to continue or Control-C to cancel > ' foo

DROP DATABASE IF EXISTS chap_chat;
CREATE DATABASE chap_chat;
\connect chap_chat

\i chap_chat_schema.sql

-- Drop and recreate the test database
\echo 'Delete and recreate chap_chat_test database?'
\prompt 'Press Enter to continue or Control-C to cancel > ' foo

DROP DATABASE IF EXISTS chap_chat_test;
CREATE DATABASE chap_chat_test;
\connect chap_chat_test

\i chap_chat_schema.sql

