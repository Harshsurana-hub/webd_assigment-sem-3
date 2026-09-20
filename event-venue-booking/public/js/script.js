// ============================================
// EventBook - Client-side JavaScript
// ============================================

document.addEventListener('DOMContentLoaded', function() {

  // ========================
  // Navbar Toggle (Mobile)
  // ========================
  const navbarToggle = document.getElementById('navbar-toggle');
  const navbarMenu = document.getElementById('navbar-menu');

  if (navbarToggle && navbarMenu) {
    navbarToggle.addEventListener('click', function() {
      navbarMenu.classList.toggle('open');
      const icon = navbarToggle.querySelector('i');
      if (navbarMenu.classList.contains('open')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
      } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
      }
    });

    // Close menu on link click
    navbarMenu.querySelectorAll('.navbar-link').forEach(function(link) {
      link.addEventListener('click', function() {
        navbarMenu.classList.remove('open');
      });
    });
  }

  // ========================
  // User Dropdown
  // ========================
  const userDropdownBtn = document.getElementById('user-dropdown-btn');
  const userDropdown = document.getElementById('user-dropdown');

  if (userDropdownBtn && userDropdown) {
    userDropdownBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      userDropdown.classList.toggle('open');
    });

    document.addEventListener('click', function(e) {
      if (!userDropdown.contains(e.target)) {
        userDropdown.classList.remove('open');
      }
    });
  }

  // ========================
  // Admin Sidebar Toggle (Mobile)
  // ========================
  const sidebar = document.getElementById('admin-sidebar');
  if (sidebar && navbarToggle) {
    // Create sidebar toggle button
    const sidebarToggle = document.createElement('button');
    sidebarToggle.className = 'sidebar-toggle';
    sidebarToggle.innerHTML = '<i class="fas fa-bars"></i>';
    sidebarToggle.style.cssText = `
      display: none;
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: #6366f1;
      color: white;
      border: none;
      font-size: 1.2rem;
      cursor: pointer;
      z-index: 999;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
      align-items: center;
      justify-content: center;
    `;

    document.body.appendChild(sidebarToggle);

    function checkSidebarToggle() {
      if (window.innerWidth <= 768) {
        sidebarToggle.style.display = 'flex';
      } else {
        sidebarToggle.style.display = 'none';
        sidebar.classList.remove('open');
      }
    }

    checkSidebarToggle();
    window.addEventListener('resize', checkSidebarToggle);

    sidebarToggle.addEventListener('click', function() {
      sidebar.classList.toggle('open');
    });

    // Close sidebar when clicking outside
    document.addEventListener('click', function(e) {
      if (window.innerWidth <= 768 && sidebar.classList.contains('open')) {
        if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
          sidebar.classList.remove('open');
        }
      }
    });
  }

  // ========================
  // Auto-dismiss alerts
  // ========================
  const alerts = document.querySelectorAll('.alert');
  alerts.forEach(function(alert) {
    setTimeout(function() {
      alert.style.opacity = '0';
      alert.style.transform = 'translateY(-8px)';
      setTimeout(function() {
        alert.remove();
      }, 300);
    }, 5000);
  });

  // ========================
  // Confirm before dangerous actions
  // ========================
  document.querySelectorAll('[data-confirm]').forEach(function(el) {
    el.addEventListener('click', function(e) {
      if (!confirm(el.dataset.confirm)) {
        e.preventDefault();
      }
    });
  });

});
