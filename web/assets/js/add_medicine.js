document.addEventListener('DOMContentLoaded', function() {
    const addForm = document.getElementById('addMedicineForm');
    addForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(addForm);
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });
        
        fetch('/api/medicine.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                alert('添加成功');
                addForm.reset();
            } else {
                alert('添加失败: ' + result.message);
            }
        })
        .catch(error => {
            console.error('错误:', error);
            alert('提交失败，请检查控制台获取详细信息');
        });
    });
}); 