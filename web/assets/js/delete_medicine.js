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
                        <button class="btn btn-sm btn-danger" onclick="confirmDelete(${medicine.id})">删除</button>
                    </td>
                `;
                medicineList.appendChild(row);
            });
        })
        .catch(error => {
            console.error('获取药品数据失败:', error);
        });
}

function confirmDelete(id) {
    if (confirm('确定要删除这个药品吗？')) {
        fetch(`/api/medicine.php?id=${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                alert('删除成功');
                fetchMedicines(); // 重新加载药品列表
            } else {
                alert('删除失败: ' + result.message);
            }
        });
    }
} 