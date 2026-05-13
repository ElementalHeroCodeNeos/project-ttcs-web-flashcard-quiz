-- FlashLearn Database Schema
-- PostgreSQL

-- ============================
-- USERS
-- ============================
CREATE TABLE users (
    id            BIGSERIAL PRIMARY KEY,
    full_name     VARCHAR(255)  NOT NULL,
    email         VARCHAR(255)  NOT NULL,
    password_hash VARCHAR(255)  NOT NULL,
    avatar_url    TEXT,
    role          VARCHAR(20)   NOT NULL DEFAULT 'user',
    status        VARCHAR(20)   NOT NULL DEFAULT 'active',
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT users_email_unique  UNIQUE (email),
    CONSTRAINT users_role_check    CHECK (role   IN ('user', 'admin')),
    CONSTRAINT users_status_check  CHECK (status IN ('active', 'inactive', 'locked'))
);

-- ============================
-- CATEGORIES
-- ============================
CREATE TABLE categories (
    id          BIGSERIAL    PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    description TEXT,
    position    INT          NOT NULL DEFAULT 0,
    status      VARCHAR(20)  NOT NULL DEFAULT 'active',
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT categories_name_unique   UNIQUE (name),
    CONSTRAINT categories_status_check  CHECK (status IN ('active', 'inactive'))
);

-- ============================
-- DECKS
-- ============================
CREATE TABLE decks (
    id           BIGSERIAL    PRIMARY KEY,
    owner_id     BIGINT       NOT NULL,
    category_id  BIGINT       NOT NULL,
    title        VARCHAR(255) NOT NULL,
    description  TEXT,
    visibility   VARCHAR(20)  NOT NULL DEFAULT 'private',
    status       VARCHAR(20)  NOT NULL DEFAULT 'active',
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    deleted_at   TIMESTAMPTZ,

    CONSTRAINT decks_owner_fk
        FOREIGN KEY (owner_id)    REFERENCES users(id)       ON DELETE RESTRICT,
    CONSTRAINT decks_category_fk
        FOREIGN KEY (category_id) REFERENCES categories(id)  ON DELETE RESTRICT,
    CONSTRAINT decks_visibility_check
        CHECK (visibility IN ('private', 'public')),
    CONSTRAINT decks_status_check
        CHECK (status IN ('active', 'hidden', 'deleted'))
);

-- ============================
-- CARDS
-- ============================
CREATE TABLE cards (
    id         BIGSERIAL   PRIMARY KEY,
    deck_id    BIGINT      NOT NULL,
    front      TEXT        NOT NULL,
    back       TEXT        NOT NULL,
    position   INT         NOT NULL DEFAULT 0,
    status     VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,

    CONSTRAINT cards_deck_fk      FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE,
    CONSTRAINT cards_status_check CHECK (status IN ('active', 'deleted'))
);

-- ============================
-- SAVED DECKS
-- ============================
CREATE TABLE saved_decks (
    id         BIGSERIAL   PRIMARY KEY,
    user_id    BIGINT      NOT NULL,
    deck_id    BIGINT      NOT NULL,
    status     VARCHAR(20) NOT NULL DEFAULT 'active',
    saved_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    removed_at TIMESTAMPTZ,

    CONSTRAINT saved_decks_user_fk
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT saved_decks_deck_fk
        FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE,
    CONSTRAINT saved_decks_status_check
        CHECK (status IN ('active', 'removed')),
    CONSTRAINT saved_decks_unique
        UNIQUE (user_id, deck_id)
);

-- ============================
-- STUDY PROGRESS (SRS)
-- ============================
CREATE TABLE study_progress (
    id               BIGSERIAL      PRIMARY KEY,
    user_id          BIGINT         NOT NULL,
    card_id          BIGINT         NOT NULL,
    repetitions      INT            NOT NULL DEFAULT 0,
    interval_days    INT            NOT NULL DEFAULT 0,
    ease_factor      NUMERIC(4,2)   NOT NULL DEFAULT 2.50,
    due_date         DATE           NOT NULL DEFAULT CURRENT_DATE,
    lapse_count      INT            NOT NULL DEFAULT 0,
    is_difficult     BOOLEAN        NOT NULL DEFAULT FALSE,
    last_reviewed_at TIMESTAMPTZ,
    created_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

    CONSTRAINT study_progress_user_fk   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT study_progress_card_fk   FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
    CONSTRAINT study_progress_unique    UNIQUE (user_id, card_id),
    CONSTRAINT study_progress_rep_check   CHECK (repetitions   >= 0),
    CONSTRAINT study_progress_int_check   CHECK (interval_days >= 0),
    CONSTRAINT study_progress_lapse_check CHECK (lapse_count   >= 0),
    CONSTRAINT study_progress_ease_check  CHECK (ease_factor   >= 1.00)
);

-- ============================
-- REVIEW LOGS
-- ============================
CREATE TABLE review_logs (
    id                     BIGSERIAL    PRIMARY KEY,
    study_progress_id      BIGINT       NOT NULL,
    rating                 VARCHAR(20)  NOT NULL,
    reviewed_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    previous_interval_days INT,
    new_interval_days      INT,
    previous_due_date      DATE,
    next_due_date          DATE,
    previous_ease_factor   NUMERIC(4,2),
    new_ease_factor        NUMERIC(4,2),

    CONSTRAINT review_logs_sp_fk
        FOREIGN KEY (study_progress_id) REFERENCES study_progress(id) ON DELETE CASCADE,
    CONSTRAINT review_logs_rating_check
        CHECK (rating IN ('again', 'hard', 'good', 'easy'))
);

-- ============================
-- QUIZ ATTEMPTS
-- ============================
CREATE TABLE quiz_attempts (
    id               BIGSERIAL     PRIMARY KEY,
    user_id          BIGINT        NOT NULL,
    deck_id          BIGINT        NOT NULL,
    quiz_type        VARCHAR(30)   NOT NULL,
    status           VARCHAR(20)   NOT NULL DEFAULT 'in_progress',
    total_questions  INT           NOT NULL DEFAULT 0,
    correct_count    INT           NOT NULL DEFAULT 0,
    score            NUMERIC(5,2)  NOT NULL DEFAULT 0,
    started_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    submitted_at     TIMESTAMPTZ,

    CONSTRAINT quiz_attempts_user_fk   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT quiz_attempts_deck_fk   FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE RESTRICT,
    CONSTRAINT quiz_attempts_type_check
        CHECK (quiz_type IN ('multiple_choice', 'matching')),
    CONSTRAINT quiz_attempts_status_check
        CHECK (status IN ('in_progress', 'submitted', 'abandoned')),
    CONSTRAINT quiz_attempts_total_check   CHECK (total_questions >= 0),
    CONSTRAINT quiz_attempts_correct_check CHECK (correct_count   >= 0),
    CONSTRAINT quiz_attempts_score_check   CHECK (score           >= 0)
);

-- ============================
-- QUIZ ATTEMPT ITEMS
-- ============================
CREATE TABLE quiz_attempt_items (
    id             BIGSERIAL   PRIMARY KEY,
    attempt_id     BIGINT      NOT NULL,
    card_id        BIGINT,
    question_text  TEXT        NOT NULL,
    correct_answer TEXT        NOT NULL,
    user_answer    TEXT,
    answer_options JSONB,
    is_correct     BOOLEAN     NOT NULL DEFAULT FALSE,
    position       INT         NOT NULL DEFAULT 0,

    CONSTRAINT quiz_attempt_items_attempt_fk
        FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    CONSTRAINT quiz_attempt_items_card_fk
        FOREIGN KEY (card_id)    REFERENCES cards(id)         ON DELETE SET NULL
);

-- ============================
-- INDEXES
-- ============================
CREATE INDEX idx_users_email         ON users(email);
CREATE INDEX idx_decks_owner         ON decks(owner_id);
CREATE INDEX idx_decks_category      ON decks(category_id);
CREATE INDEX idx_decks_public        ON decks(visibility, status);
CREATE INDEX idx_cards_deck          ON cards(deck_id);
CREATE INDEX idx_saved_decks_user    ON saved_decks(user_id);
CREATE INDEX idx_saved_decks_deck    ON saved_decks(deck_id);
CREATE INDEX idx_study_progress_due  ON study_progress(user_id, due_date);
CREATE INDEX idx_quiz_attempts_user  ON quiz_attempts(user_id, submitted_at);
CREATE INDEX idx_quiz_attempts_deck  ON quiz_attempts(deck_id);
CREATE INDEX idx_quiz_items_attempt  ON quiz_attempt_items(attempt_id);
