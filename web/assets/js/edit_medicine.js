document.addEventListener('DOMContentLoaded', function() {
    fetchMedicines();
});

function fetchMedicines() {
    fetch('/api/medicine.php')
        .then(response => response.json())
        .then(data => {
            const medicineList = document.getElementById('medicineList');
            medicineList.innerHTML = ''; // 清空现有内容

            data.forEach(medicine => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${medicine.name}</td>
                    <td>${medicine.batch_number}</td>
                    <td>${medicine.unique_code}</td>
                    <td>${medicine.quantity}</td>
                    <td>${medicine.expiry_date}</td>
                    <td>${medicine.location}</td>
                    <td>${medicine.notes}</td>
                    <td>
                        <button class="btn btn-sm btn-warning" onclick="openEditModal(${medicine.id})">编辑</button>
                    </td>
                `;
                medicineList.appendChild(row);
            });
        })
        .catch(error => {
            console.error('获取药品数据失败:', error);
        });
}

function openEditModal(id) {
    fetch(`/api/medicine.php?id=${id}`)
        .then(response => response.json())
        .then(medicine => {
            // 确保药品数据存在
            if (medicine) {
                document.getElementById('editMedicineId').value = medicine.id;
                document.getElementById('editMedicineName').value = medicine.name || '';
                document.getElementById('editMedicineBatchNumber').value = medicine.batch_number || '';
                document.getElementById('editMedicineUniqueCode').value = medicine.unique_code || '';
                document.getElementById('editMedicineQuantity').value = medicine.quantity || '';
                document.getElementById('editMedicineExpiryDate').value = medicine.expiry_date || '';
                document.getElementById('editMedicineLocation').value = medicine.location || '';
                document.getElementById('editMedicineNotes').value = medicine.notes || '';

                // 显示模态框
                const editModal = new bootstrap.Modal(document.getElementById('editModal'));
                editModal.show();
            } else {
                alert('未找到药品信息');
            }
        })
        .catch(error => {
            console.error('获取药品详细信息失败:', error);
        });
}

// 处理编辑表单提交
document.getElementById('editMedicineForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const id = document.getElementById('editMedicineId').value;
    const data = {
        name: document.getElementById('editMedicineName').value,
        batch_number: document.getElementById('editMedicineBatchNumber').value,
        unique_code: document.getElementById('editMedicineUniqueCode').value,
        quantity: document.getElementById('editMedicineQuantity').value,
        expiry_date: document.getElementById('editMedicineExpiryDate').value,
        location: document.getElementById('editMedicineLocation').value,
        notes: document.getElementById('editMedicineNotes').value
    };

    fetch(`/api/medicine.php?id=${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            alert('更新成功');
            fetchMedicines(); // 重新加载药品列表
        } else {
            alert('更新失败: ' + result.message);
        }
    });
}); 