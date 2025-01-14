document.addEventListener('DOMContentLoaded', function() {
    loadExpiringMedicines();
});

function loadExpiringMedicines() {
    fetch('/api/medicine.php?action=expiring')
        .then(response => response.json())
        .then(data => {
            const tbody = document.getElementById('expiringList');
            tbody.innerHTML = '';
            
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

// 复用 main.js 中的删除和出库功能
function deleteMedicine(id) {
    if (confirm('确定要删除这个药品吗？')) {
        fetch(`/api/medicine.php?id=${id}`, {
            method: 'DELETE'
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
        fetch(`/api/medicine.php?id=${id}&action=outbound`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ quantity: parseInt(quantity) })
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