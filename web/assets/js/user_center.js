document.addEventListener('DOMContentLoaded', function() {
    // 检查用户会话
    fetch('/api/check_session.php')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (!data.success) {
                window.location.href = 'login.html';
                return;
            }
            // 显示用户名
            document.getElementById('username').value = data.user.username;
            
            // 设置功能区标题
            const functionTitle = document.getElementById('functionTitle');
            const functionList = document.getElementById('functionList');
            
            // 根据用户角色显示不同的功能列表
            if (data.user.is_admin) {
                functionTitle.textContent = '管理员功能';
                functionList.innerHTML = `
                    <a href="user_management.html" class="list-group-item list-group-item-action">
                        <i class="bi bi-people"></i> 用户管理
                    </a>
                    <a href="add_medicine.html" class="list-group-item list-group-item-action">
                        <i class="bi bi-plus-circle"></i> 添加药品
                    </a>
                    <a href="edit_medicine.html" class="list-group-item list-group-item-action">
                        <i class="bi bi-pencil"></i> 编辑药品
                    </a>
                    <a href="delete_medicine.html" class="list-group-item list-group-item-action">
                        <i class="bi bi-trash"></i> 删除药品
                    </a>`;
            } else {
                functionTitle.textContent = '功能列表';
                functionList.innerHTML = `
                    <a href="search_medicine.html" class="list-group-item list-group-item-action">
                        <i class="bi bi-search"></i> 搜索药品
                    </a>
                    <a href="outbound_medicine.html" class="list-group-item list-group-item-action">
                        <i class="bi bi-box-arrow-right"></i> 出库药品
                    </a>
                    <a href="expiring.html" class="list-group-item list-group-item-action">
                        <i class="bi bi-clock-history"></i> 即将过期
                    </a>`;
            }
        })
        .catch(error => {
            console.error('Session check failed:', error);
            alert('会话验证失败，请重新登录');
            window.location.href = 'login.html';
        });

    // 处理密码修改表单提交
    document.getElementById('changePasswordForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const currentPassword = formData.get('current_password');
        const newPassword = formData.get('new_password');
        const confirmPassword = formData.get('confirm_password');

        if (newPassword !== confirmPassword) {
            alert('新密码和确认密码不匹配');
            return;
        }

        fetch('/api/user.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'change_password',
                current_password: currentPassword,
                new_password: newPassword
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('密码修改成功');
                // 清空表单
                document.getElementById('changePasswordForm').reset();
            } else {
                alert(data.message || '密码修改失败');
            }
        })
        .catch(error => {
            console.error('Password change failed:', error);
            alert('密码修改失败，请稍后重试');
        });
    });

    // 处理注销按钮点击
    document.getElementById('logoutBtn').addEventListener('click', function() {
        fetch('/api/logout.php')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.href = 'login.html';
                } else {
                    alert('注销失败，请重试');
                }
            })
            .catch(error => {
                console.error('Logout failed:', error);
                alert('注销失败，请重试');
            });
    });
});