document.addEventListener('DOMContentLoaded', function() {
    // 初始隐藏页面内容
    document.querySelector('.container').style.display = 'none';

    // 检查用户权限
    fetch('/api/check_session.php')
        .then(response => response.json())
        .then(data => {
            if (!data.success || !data.user.is_admin) {
                window.location.href = 'user_center.html';
                return;
            }
            // 权限验证通过后显示页面内容并加载用户列表
            document.querySelector('.container').style.display = 'block';
            loadUsers();
        })
        .catch(error => {
            console.error('Error:', error);
            window.location.href = 'login.html';
        });

    // 加载用户列表
    function loadUsers() {
        fetch('/api/user.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: 'list' })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const userList = document.getElementById('userList');
                    userList.innerHTML = '';
                    data.users.forEach(user => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${user.id}</td>
                            <td>${user.username}</td>
                            <td>${user.is_admin === '1' ? '管理员' : '普通用户'}</td>
                            <td>${user.created_at}</td>
                            <td>
                                <button class="btn btn-sm btn-primary me-2" onclick="editUser(${user.id})">编辑</button>
                                <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id})">删除</button>
                            </td>
                        `;
                        userList.appendChild(row);
                    });
                }
            })
            .catch(error => console.error('Error:', error));
    }

    // 添加用户
    document.getElementById('addUserBtn').addEventListener('click', function() {
        const form = document.getElementById('addUserForm');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        data.action = 'create';

        fetch('/api/user.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('用户添加成功');
                form.reset();
                const modal = bootstrap.Modal.getInstance(document.getElementById('addUserModal'));
                modal.hide();
                loadUsers();
            } else {
                alert(data.message || '添加失败');
            }
        })
        .catch(error => console.error('Error:', error));
    });

    // 编辑用户
    window.editUser = function(id) {
        fetch('/api/user.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: 'get_user_info', id: id })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const form = document.getElementById('editUserForm');
                    form.elements['id'].value = id;
                    form.elements['username'].value = data.data.username;
                    form.elements['role'].value = data.data.is_admin === '1' ? 'admin' : 'user';
                    const modal = new bootstrap.Modal(document.getElementById('editUserModal'));
                    modal.show();
                }
            })
            .catch(error => console.error('Error:', error));
    };

    document.getElementById('editUserBtn').addEventListener('click', function() {
        const form = document.getElementById('editUserForm');
        const formData = new FormData(form);
        const data = {
            username: formData.get('username'),
            password: formData.get('password'),
            action: 'edit',
            user_id: formData.get('id'),
            is_admin: formData.get('role') === 'admin' ? '1' : '0'
        };

        // 确保所有必要字段都有值
        if (!data.user_id || !data.username) {
            alert('缺少必要的用户信息');
            return;
        }

        fetch('/api/user.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('用户更新成功');
                const modal = bootstrap.Modal.getInstance(document.getElementById('editUserModal'));
                modal.hide();
                loadUsers();
            } else {
                alert(data.message || '更新失败');
            }
        })
        .catch(error => console.error('Error:', error));
    });

    // 删除用户
    window.deleteUser = function(id) {
        if (confirm('确定要删除这个用户吗？')) {
            fetch('/api/user.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action: 'delete', user_id: id })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('用户删除成功');
                    loadUsers();
                } else {
                    alert(data.message || '删除失败');
                }
            })
            .catch(error => console.error('Error:', error));
        }
    };
});