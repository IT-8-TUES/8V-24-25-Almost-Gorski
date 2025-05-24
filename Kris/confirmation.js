document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.Reg-form');
    
    function showNotification() {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = 'Form submitted successfully!';
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        showNotification();
        form.reset();
    });
});
