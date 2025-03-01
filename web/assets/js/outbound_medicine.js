document.addEventListener('DOMContentLoaded', function() {
    // 检查用户登录状态
    fetch('/api/check_session.php')
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                // 如果未登录，重定向到登录页面
                window.location.href = 'login.html';
                return;
            }
            // 如果已登录，加载药品列表
            loadMedicineList();
        })
        .catch(error => {
            console.error('检查登录状态失败:', error);
            window.location.href = 'login.html';
        });
});

function loadMedicineList() {
    fetch('/api/medicine.php')
        .then(response => response.json())
        .then(data => {
            const medicineList = document.getElementById('medicineList');
            medicineList.innerHTML = '';

            if (data.length === 0) {
                // 添加空数据提示
                const emptyRow = document.createElement('tr');
                emptyRow.innerHTML = `
                    <td colspan="9" class="text-center text-muted" style="padding: 50px 0; font-size: 1.2em;">
                        暂无数据
                    </td>
                `;
                medicineList.appendChild(emptyRow);
                return;
            }

            data.forEach(medicine => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${medicine.name}</td>
                    <td>${medicine.batch_number}</td>
                    <td>${medicine.unique_code}</td>
                    <td>${medicine.quantity}</td>
                    <td>${medicine.unit || '件'}</td>
                    <td>${medicine.expiry_date}</td>
                    <td>${medicine.location}</td>
                    <td>${medicine.notes || '-'}</td>
                    <td>
                        <button class="btn btn-primary btn-sm" 
                                onclick="showOutboundModal(${medicine.id}, ${medicine.quantity})">
                            出库
                        </button>
                    </td>
                `;
                medicineList.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error:', error);
            alert('加载药品列表失败');
        });
}

function showOutboundModal(medicineId, maxQuantity) {
    const modal = document.getElementById('outboundModal');
    const quantityInput = document.getElementById('outboundQuantity');
    const confirmButton = document.getElementById('confirmOutbound');

    // 设置数量输入框的最大值
    quantityInput.max = maxQuantity;
    quantityInput.value = 1;

    // 显示模态框
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();

    // 绑定确认按钮事件
    confirmButton.onclick = function() {
        const outboundQuantity = parseInt(quantityInput.value);

        if (outboundQuantity <= 0 || outboundQuantity > maxQuantity) {
            alert('出库数量无效');
            return;
        }

        fetch('/api/medicine.php?action=outbound', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: medicineId,
                quantity: outboundQuantity
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('出库成功');
                modalInstance.hide();
                loadMedicineList(); // 重新加载列表
            } else {
                alert(data.message || '出库失败');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('出库操作失败');
        });
    };
}

function outboundMedicine(medicineId, button) {
    const row = button.closest('tr');
    const quantityInput = row.querySelector('.outbound-quantity');
    const outboundQuantity = parseInt(quantityInput.value);
    const currentQuantity = parseInt(row.cells[3].textContent);

    if (outboundQuantity <= 0 || outboundQuantity > currentQuantity) {
        alert('出库数量无效');
        return;
    }

    if (!confirm(`确认要出库 ${outboundQuantity} 个单位的药品吗？`)) {
        return;
    }

    fetch('/api/medicine.php?action=outbound', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id: medicineId,
            quantity: outboundQuantity
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('出库成功');
            loadMedicineList(); // 重新加载列表
        } else {
            alert(data.message || '出库失败');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('出库操作失败');
    });
}