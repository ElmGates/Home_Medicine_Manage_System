document.addEventListener('DOMContentLoaded', function() {

    const searchForm = document.getElementById('searchForm');
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const query = document.getElementById('searchQuery').value;

        fetch(`/api/medicine.php?search=${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(data => {
                const resultsTable = document.getElementById('medicineResults').getElementsByTagName('tbody')[0];
                resultsTable.innerHTML = ''; // 清空现有内容

                if (data.length === 0) {
                    // 添加空数据提示
                    const emptyRow = document.createElement('tr');
                    emptyRow.innerHTML = `
                        <td colspan="9" class="text-center text-muted" style="padding: 50px 0; font-size: 1.2em;">
                            暂无数据
                        </td>
                    `;
                    resultsTable.appendChild(emptyRow);
                    return;
                }

                data.forEach(medicine => {
                    const row = resultsTable.insertRow();
                    row.innerHTML = `
                        <td>${medicine.name}</td>
                        <td class="d-none d-md-table-cell">${medicine.batch_number}</td>
                        <td>${medicine.unique_code}</td>
                        <td class="d-none d-md-table-cell">${medicine.quantity}</td>
                        <td class="d-none d-md-table-cell">${medicine.unit || '件'}</td>
                        <td class="d-none d-md-table-cell">${medicine.expiry_date}</td>
                        <td class="d-none d-md-table-cell">${medicine.location}</td>
                        <td class="d-none d-md-table-cell">${medicine.notes}</td>
                        <td>
                            <div class="btn-group btn-group-sm">
                                <button class="btn btn-info d-md-none" onclick="showDetails(${medicine.id})">详情</button>
                                <button class="btn btn-warning" onclick="openEditModal(${medicine.id})">编辑</button>
                                <button class="btn btn-primary" onclick="openOutboundModal(${medicine.id})">出库</button>
                                <button class="btn btn-danger" onclick="confirmDelete(${medicine.id})">删除</button>
                            </div>
                        </td>
                    `;
                });
            })
            .catch(error => {
                console.error('查询失败:', error);
            });
    });
});

// 检查用户是否已登录
function checkSession() {
    return fetch('/api/check_session.php')
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                window.location.href = 'login.html';
                return false;
            }
            return true;
        });
}

// 打开编辑模态框
function openEditModal(id) {
    checkSession().then(isLoggedIn => {
        if (!isLoggedIn) return;
        fetch(`/api/medicine.php?id=${id}`)
            .then(response => response.json())
            .then(medicine => {
                document.getElementById('editMedicineId').value = medicine.id;
                document.getElementById('editMedicineName').value = medicine.name || '';
                document.getElementById('editMedicineBatchNumber').value = medicine.batch_number || '';
                document.getElementById('editMedicineUniqueCode').value = medicine.unique_code || '';
                document.getElementById('editMedicineQuantity').value = medicine.quantity || '';
                document.getElementById('editMedicineUnit').value = medicine.unit || '件';
                document.getElementById('editMedicineExpiryDate').value = medicine.expiry_date || '';
                document.getElementById('editMedicineLocation').value = medicine.location || '';
                document.getElementById('editMedicineNotes').value = medicine.notes || '';

                const editModal = new bootstrap.Modal(document.getElementById('editModal'));
                editModal.show();
            });
    });
}

// 处理编辑表单提交
document.getElementById('editMedicineForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const id = document.getElementById('editMedicineId').value;
    const formData = {
        name: document.getElementById('editMedicineName').value,
        batch_number: document.getElementById('editMedicineBatchNumber').value,
        unique_code: document.getElementById('editMedicineUniqueCode').value,
        quantity: document.getElementById('editMedicineQuantity').value,
        unit: document.getElementById('editMedicineUnit').value,
        expiry_date: document.getElementById('editMedicineExpiryDate').value,
        location: document.getElementById('editMedicineLocation').value,
        notes: document.getElementById('editMedicineNotes').value
    };

    // 验证必填字段
    if (!formData.name || !formData.batch_number || !formData.quantity || !formData.expiry_date || !formData.location) {
        alert('药品名称、批号、数量、过期日期和位置为必填项，请确保填写完整！');
        return;
    }

    fetch(`/api/medicine.php?id=${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            alert('更新成功');
            bootstrap.Modal.getInstance(document.getElementById('editModal')).hide();
            document.getElementById('searchForm').dispatchEvent(new Event('submit'));
        } else {
            alert('更新失败: ' + result.message);
        }
    });
});

// 打开出库模态框
function openOutboundModal(id) {
    checkSession().then(isLoggedIn => {
        if (!isLoggedIn) return;
        fetch(`/api/medicine.php?id=${id}`)
            .then(response => response.json())
            .then(medicine => {
                document.getElementById('outboundMedicineId').value = medicine.id;
                document.getElementById('outboundMedicineName').textContent = medicine.name;
                document.getElementById('outboundQuantityMax').value = medicine.quantity;
                document.getElementById('outboundQuantity').value = '1';
                document.getElementById('outboundQuantity').max = medicine.quantity;

                const outboundModal = new bootstrap.Modal(document.getElementById('outboundModal'));
                outboundModal.show();
            });
    });
}

// 处理出库表单提交
document.getElementById('outboundForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const id = document.getElementById('outboundMedicineId').value;
    const quantity = parseInt(document.getElementById('outboundQuantity').value);
    const maxQuantity = parseInt(document.getElementById('outboundQuantityMax').value);

    if (quantity <= 0 || quantity > maxQuantity) {
        alert('出库数量无效');
        return;
    }

    fetch('/api/medicine.php?action=outbound', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: id,
            quantity: quantity
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            alert('出库成功');
            bootstrap.Modal.getInstance(document.getElementById('outboundModal')).hide();
            document.getElementById('searchForm').dispatchEvent(new Event('submit'));
        } else {
            alert('出库失败: ' + result.message);
        }
    });
});

// 确认删除
function confirmDelete(id) {
    checkSession().then(isLoggedIn => {
        if (!isLoggedIn) return;
        fetch(`/api/medicine.php?id=${id}`)
            .then(response => response.json())
            .then(medicine => {
                if (confirm(`确定要删除 ${medicine.name} 吗？`)) {
                    fetch(`/api/medicine.php?id=${id}`, {
                        method: 'DELETE'
                    })
                    .then(response => response.json())
                    .then(result => {
                        if (result.success) {
                            alert('删除成功');
                            document.getElementById('searchForm').dispatchEvent(new Event('submit'));
                        } else {
                            alert('删除失败: ' + result.message);
                        }
                    });
                }
            });
    });
}

// 显示药品详情
function showDetails(id) {
    fetch(`/api/medicine.php?id=${id}`)
        .then(response => response.json())
        .then(medicine => {
            document.getElementById('detailMedicineName').textContent = medicine.name;
            document.getElementById('detailMedicineBatchNumber').textContent = medicine.batch_number;
            document.getElementById('detailMedicineUniqueCode').textContent = medicine.unique_code;
            document.getElementById('detailMedicineQuantity').textContent = medicine.quantity;
            document.getElementById('detailMedicineUnit').textContent = medicine.unit || '件';
            document.getElementById('detailMedicineExpiryDate').textContent = medicine.expiry_date;
            document.getElementById('detailMedicineLocation').textContent = medicine.location;
            document.getElementById('detailMedicineNotes').textContent = medicine.notes || '';

            const detailModal = new bootstrap.Modal(document.getElementById('detailModal'));
            detailModal.show();
        })
        .catch(error => {
            console.error('获取药品详情失败:', error);
            alert('获取药品详情失败，请稍后重试');
        });
}