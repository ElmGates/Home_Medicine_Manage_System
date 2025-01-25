<?php
require_once 'db.php';

$username = 'admin';
$password = 'password123';
$password_hash = password_hash($password, PASSWORD_DEFAULT);

try {
    $db = new Database();
    $pdo = $db->getConnection();
    
    // 先检查是否已存在同名用户
    $check_stmt = $pdo->prepare('SELECT id FROM users WHERE username = ?');
    $check_stmt->execute([$username]);
    if ($check_stmt->fetch()) {
        // 如果用户已存在，则更新密码
        $stmt = $pdo->prepare('UPDATE users SET password_hash = ?, is_admin = 1 WHERE username = ?');
        $stmt->execute([$password_hash, $username]);
        echo "管理员用户更新成功！\n";
    } else {
        // 如果用户不存在，则创建新用户
        $stmt = $pdo->prepare('INSERT INTO users (username, password_hash, is_admin) VALUES (?, ?, 1)');
        $stmt->execute([$username, $password_hash]);
        echo "管理员用户创建成功！\n";
    }
} catch (PDOException $e) {
    echo "操作失败: " . $e->getMessage() . "\n";
}