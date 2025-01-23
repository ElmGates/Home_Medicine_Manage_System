<?php
require_once 'db.php';
session_start();

// 检查用户是否已登录
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => '未登录']);
    exit;
}

// 初始化数据库连接
$db = new Database();
$pdo = $db->getConnection();

// 获取请求数据
$data = json_decode(file_get_contents('php://input'), true);
$action = isset($data['action']) ? $data['action'] : '';

switch ($action) {
    case 'create':
        // 检查是否为管理员
        $stmt = $pdo->prepare('SELECT is_admin FROM users WHERE id = ?');
        $stmt->execute([$_SESSION['user_id']]);
        $user = $stmt->fetch();
        if (!$user || !$user['is_admin']) {
            echo json_encode(['success' => false, 'message' => '权限不足']);
            exit;
        }

        // 验证请求参数
        if (!isset($data['username']) || !isset($data['password'])) {
            echo json_encode(['success' => false, 'message' => '参数不完整']);
            exit;
        }

        // 检查用户名是否已存在
        $stmt = $pdo->prepare('SELECT id FROM users WHERE username = ?');
        $stmt->execute([$data['username']]);
        if ($stmt->fetch()) {
            echo json_encode(['success' => false, 'message' => '用户名已存在']);
            exit;
        }

        // 创建新用户
        $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
        $is_admin = isset($data['is_admin']) ? intval($data['is_admin']) : 0;
        $stmt = $pdo->prepare('INSERT INTO users (username, password_hash, is_admin) VALUES (?, ?, ?)');
        
        if ($stmt->execute([$data['username'], $hashedPassword, $is_admin])) {
            echo json_encode(['success' => true, 'message' => '用户创建成功']);
        } else {
            echo json_encode(['success' => false, 'message' => '用户创建失败']);
        }
        break;

    case 'change_password':
        // 验证请求参数
        if (!isset($data['current_password']) || !isset($data['new_password'])) {
            echo json_encode(['success' => false, 'message' => '参数不完整']);
            exit;
        }

        $userId = $_SESSION['user_id'];
        $currentPassword = $data['current_password'];
        $newPassword = $data['new_password'];

        // 验证当前密码
        $stmt = $pdo->prepare('SELECT password_hash FROM users WHERE id = ?');
        $stmt->execute([$userId]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($currentPassword, $user['password_hash'])) {
            echo json_encode(['success' => false, 'message' => '当前密码错误']);
            exit;
        }

        // 更新密码
        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare('UPDATE users SET password_hash = ? WHERE id = ?');
        
        if ($stmt->execute([$hashedPassword, $userId])) {
            echo json_encode(['success' => true, 'message' => '密码修改成功']);
        } else {
            echo json_encode(['success' => false, 'message' => '密码修改失败']);
        }
        break;

    case 'get_user_info':
        // 检查是否为管理员
        $stmt = $pdo->prepare('SELECT is_admin FROM users WHERE id = ?');
        $stmt->execute([$_SESSION['user_id']]);
        $user = $stmt->fetch();
        if (!$user || !$user['is_admin']) {
            echo json_encode(['success' => false, 'message' => '权限不足']);
            exit;
        }

        // 获取指定用户信息
        $userId = isset($data['id']) ? $data['id'] : 0;
        $stmt = $pdo->prepare('SELECT username, is_admin FROM users WHERE id = ?');
        $stmt->execute([$userId]);
        $user = $stmt->fetch();

        if ($user) {
            echo json_encode([
                'success' => true,
                'data' => [
                    'username' => $user['username'],
                    'is_admin' => (bool)$user['is_admin']
                ]
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => '获取用户信息失败']);
        }
        break;

    case 'list':
        // 检查是否为管理员
        $stmt = $pdo->prepare('SELECT is_admin FROM users WHERE id = ?');
        $stmt->execute([$_SESSION['user_id']]);
        $user = $stmt->fetch();
        if (!$user || !$user['is_admin']) {
            echo json_encode(['success' => false, 'message' => '权限不足']);
            exit;
        }

        // 获取用户列表
        $stmt = $pdo->prepare('SELECT id, username, is_admin, created_at FROM users');
        $stmt->execute();
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'users' => $users
        ]);
        break;

    case 'edit':
        // 检查是否为管理员
        $stmt = $pdo->prepare('SELECT is_admin FROM users WHERE id = ?');
        $stmt->execute([$_SESSION['user_id']]);
        $user = $stmt->fetch();
        if (!$user || !$user['is_admin']) {
            echo json_encode(['success' => false, 'message' => '权限不足']);
            exit;
        }

        // 验证请求参数
        if (!isset($data['user_id']) || !isset($data['username'])) {
            echo json_encode(['success' => false, 'message' => '参数不完整']);
            exit;
        }

        // 检查用户是否存在
        $stmt = $pdo->prepare('SELECT id FROM users WHERE id = ?');
        $stmt->execute([$data['user_id']]);
        if (!$stmt->fetch()) {
            echo json_encode(['success' => false, 'message' => '用户不存在']);
            exit;
        }

        // 如果修改用户名，检查新用户名是否已存在
        $stmt = $pdo->prepare('SELECT id FROM users WHERE username = ? AND id != ?');
        $stmt->execute([$data['username'], $data['user_id']]);
        if ($stmt->fetch()) {
            echo json_encode(['success' => false, 'message' => '用户名已存在']);
            exit;
        }

        // 更新用户信息
        $is_admin = isset($data['is_admin']) ? intval($data['is_admin']) : 0;
        if (!empty($data['password'])) {
            $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
            $stmt = $pdo->prepare('UPDATE users SET username = ?, password_hash = ?, is_admin = ? WHERE id = ?');
            $result = $stmt->execute([$data['username'], $hashedPassword, $is_admin, $data['user_id']]);
        } else {
            $stmt = $pdo->prepare('UPDATE users SET username = ?, is_admin = ? WHERE id = ?');
            $result = $stmt->execute([$data['username'], $is_admin, $data['user_id']]);
        }
        
        if ($result) {
            echo json_encode(['success' => true, 'message' => '用户信息更新成功']);
        } else {
            echo json_encode(['success' => false, 'message' => '用户信息更新失败']);
        }
        break;

    case 'delete':
        // 检查是否为管理员
        $stmt = $pdo->prepare('SELECT is_admin FROM users WHERE id = ?');
        $stmt->execute([$_SESSION['user_id']]);
        $user = $stmt->fetch();
        if (!$user || !$user['is_admin']) {
            echo json_encode(['success' => false, 'message' => '权限不足']);
            exit;
        }

        // 验证请求参数
        if (!isset($data['user_id'])) {
            echo json_encode(['success' => false, 'message' => '参数不完整']);
            exit;
        }

        // 不允许删除自己
        if ($data['user_id'] == $_SESSION['user_id']) {
            echo json_encode(['success' => false, 'message' => '不能删除当前登录用户']);
            exit;
        }

        // 删除用户
        $stmt = $pdo->prepare('DELETE FROM users WHERE id = ?');
        
        if ($stmt->execute([$data['user_id']])) {
            echo json_encode(['success' => true, 'message' => '用户删除成功']);
        } else {
            echo json_encode(['success' => false, 'message' => '用户删除失败']);
        }
        break;

    default:
        echo json_encode(['success' => false, 'message' => '未知操作']);
        break;
}