-- 插入管理员用户
INSERT INTO users (username, password_hash, is_admin) VALUES
('admin', '$2y$10$k9LXKZjy1fRoEsMT/L8GGe2oygAsOtx8qjVsXllMKXadxWk6JJtRq', 1);

-- 插入普通用户
INSERT INTO users (username, password_hash, is_admin) VALUES
('user', '$2y$10$NUsn41y3insJC5HgSSouUOK.aAStK/K.Gdhmz7MYZ3z3NKyCZv.Zq', 0);

-- 密码对应关系：
-- admin: password123
-- user: 123456