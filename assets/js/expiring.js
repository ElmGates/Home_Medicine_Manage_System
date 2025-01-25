document.addEventListener('DOMContentLoaded', function() {
    loadExpiringMedicines();
});

function loadExpiringMedicines() {
    fetch('/api/medicine.php?action=expiring')
        .then(response => response.json())
        .then(data => {
            const tbody = document.getElementById('expiringList');
            tbody.innerHTML = '';
            
            if (data.length === 0) {
                // 添加空数据提示
                const emptyRow = document.createElement('tr');
                emptyRow.innerHTML = `
                    <td colspan="8" class="text-center text-muted" style="padding: 50px 0; font-size: 1.2em;">
                        暂无数据
                    </td>
                `;
                tbody.appendChild(emptyRow);
                return;
            }
            
            data.forEach(medicine => {
                const expiryDate = new Date(medicine.expiry_date);
                const today = new Date();
                const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
                
                const row = document.createElement('tr');
                row.className = daysLeft <= 7 ? 'table-danger' : 'table-warning';
                row.innerHTML = `
                    <td>${medicine.name}</td>
                    <td>${medicine.batch_number}</td>
                    <td>${medicine.quantity}</td>
                    <td>${medicine.unit || '件'}</td>
                    <td>${medicine.expiry_date}</td>
                    <td>${medicine.location}</td>
                    <td>${daysLeft}天</td>
                    <td>
                        <button class="btn btn-sm btn-danger" onclick="deleteMedicine(${medicine.id})">删除</button>
                        <button class="btn btn-sm btn-info" onclick="updateQuantity(${medicine.id})">出库</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        });
}

function deleteMedicine(id) {
    if (confirm('确定要删除这个药品吗？')) {
        // 先检查会话
        fetch('/api/check_session.php')
            .then(response => response.json())
            .then(data => {
                if (!data.success) {
                    window.location.href = 'login.html';
                    return;
                }
                // 会话验证通过后执行删除操作
                return fetch(`/api/medicine.php?id=${id}`, {
                    method: 'DELETE'
                });
            })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    loadExpiringMedicines();
                } else {
                    alert('删除失败: ' + result.message);
                }
            });
    }
}

function updateQuantity(id) {
    const quantity = prompt('请输入出库数量:');
    if (quantity !== null) {
        // 先检查会话
        fetch('/api/check_session.php')
            .then(response => response.json())
            .then(data => {
                if (!data.success) {
                    window.location.href = 'login.html';
                    return;
                }
                // 会话验证通过后执行出库操作
                return fetch('/api/medicine.php?action=outbound', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        id: id,
                        quantity: parseInt(quantity)
                    })
                });
            })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    loadExpiringMedicines();
                } else {
                    alert('出库失败: ' + result.message);
                }
            });
    }
}