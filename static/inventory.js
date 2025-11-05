document.addEventListener("DOMContentLoaded", () => {
  const stockForms = document.querySelectorAll(".stock-form");

  stockForms.forEach(form => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const foodNameInput = form.querySelector("input[name='food_name']");
      const ingredientNameInput = form.querySelector("input[name='ingredient_name']");
      const inputValue = form.querySelector("input[name='new_stock']").value.trim();
      const action = form.dataset.action || "add"; // "add" or "update"

      if (!inputValue || isNaN(inputValue) || parseInt(inputValue) < 0) {
        alert("⚠️ Please enter a valid non-negative stock number.");
        return;
      }

      let endpoint = "";
      let itemName = "";
      let key = "";
      let finalStock = parseInt(inputValue);

      // ===== Food (Add Stock) =====
      if (foodNameInput) {
        endpoint = "/update_stock";
        itemName = foodNameInput.value;
        key = "food_name";
      }
      // ===== Ingredient (Add or Update Stock) =====
      else if (ingredientNameInput) {
        endpoint = "/update_ingredient_stock";
        itemName = ingredientNameInput.value;
        key = "ingredient_name";
      }

      // ===== Update UI immediately =====
      const currentStockCell = form.closest("tr").querySelector("td:nth-child(2)");
      const currentStock = parseInt(currentStockCell.textContent) || 0;

      if (action === "add") {
        finalStock = currentStock + finalStock; // add
      } else if (action === "update") {
        finalStock = parseInt(inputValue); // replace
      }

      currentStockCell.textContent = finalStock;

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `${key}=${encodeURIComponent(itemName)}&new_stock=${encodeURIComponent(finalStock)}`
        });

        if (response.ok) {
          const message =
            action === "add"
              ? `✅ ${itemName} stock increased by ${inputValue}!`
              : `✅ ${itemName} stock updated to ${finalStock}!`;
          alert(message);
          form.reset();

          // 🟢 FIX: prevent page reload or re-render from backend
          if (window.history && window.history.replaceState) {
            window.history.replaceState(null, null, window.location.href);
          }

        } else {
          const text = await response.text();
          alert("❌ Error updating stock: " + text);
        }
      } catch (err) {
        alert("❌ Error: " + err);
      }
    });
  });
});

// ===== Charts =====
const salesTrendChart = new Chart(document.getElementById('salesTrendChart'), {
  type: 'line',
  data: {
    labels: salesLabels,
    datasets: [{
      label: 'Sales (₱)',
      data: salesTotals,
      borderColor: '#ffb347',
      backgroundColor: 'rgba(255,179,71,0.2)',
      tension: 0.3,
      fill: true,
      pointRadius: 5
    }]
  },
  options: {
    responsive: true,
    plugins: { 
      legend: { display: true },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `₱${context.parsed.y.toFixed(2)}`;
          }
        }
      }
    },
    scales: { 
      y: { 
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '₱' + value.toFixed(2);
          }
        }
      } 
    }
  }
});

// Dynamic colors for Best-selling Items
const bestSellingColors = bestSellingLabels.map((_, i) => `hsl(${i * 60 % 360}, 70%, 50%)`);

const bestSellingChart = new Chart(document.getElementById('bestSellingChart'), {
  type: 'bar',
  data: {
    labels: bestSellingLabels,
    datasets: [{
      label: 'Units Sold',
      data: bestSellingTotals,
      backgroundColor: bestSellingColors,
      borderRadius: 6
    }]
  },
  options: {
    responsive: true,
    plugins: { legend: { display: false }, tooltip: { enabled: true } },
    scales: { y: { beginAtZero: true } }
  }
});

const stockChart = new Chart(document.getElementById('stockChart'), {
  type: 'pie',
  data: {
    labels: stockLabels,
    datasets: [{
      label: 'Stock Distribution',
      data: stockTotals,
      backgroundColor: [
        '#ff8000','#ffb347','#ff9c33','#ffa500','#ffcc80','#ff704d','#ffab40'
      ]
    }]
  },
  options: {
    responsive: true,
    plugins: { legend: { position: 'right' } }
  }
});

// ===== Dropdowns =====
document.addEventListener("DOMContentLoaded", function () {
  // Mobile menu elements
  const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
  const navWrapper = document.querySelector(".nav-wrapper");
  const mobileOverlay = document.createElement("div");
  mobileOverlay.className = "mobile-menu-overlay";
  document.body.appendChild(mobileOverlay);

  // All nav dropdowns
  const navDropdowns = document.querySelectorAll(".nav-dropdown");
  // Profile dropdown
  const profileDropdown = document.querySelector(".profile-dropdown");
  const profileBtn = document.querySelector(".profile-btn");

  // Mobile menu functionality
  function toggleMobileMenu() {
    const isActive = navWrapper.classList.contains("active");
    
    mobileMenuBtn.classList.toggle("active", !isActive);
    navWrapper.classList.toggle("active", !isActive);
    mobileOverlay.classList.toggle("active", !isActive);
    document.body.classList.toggle("mobile-menu-open", !isActive);
  }

  // Close mobile menu
  function closeMobileMenu() {
    mobileMenuBtn.classList.remove("active");
    navWrapper.classList.remove("active");
    mobileOverlay.classList.remove("active");
    document.body.classList.remove("mobile-menu-open");
    
    // Close all dropdowns when mobile menu closes
    navDropdowns.forEach(d => d.classList.remove("active"));
    if (profileDropdown) profileDropdown.classList.remove("active");
  }

  // Mobile menu event listeners
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      toggleMobileMenu();
    });
  }

  mobileOverlay.addEventListener("click", closeMobileMenu);

  // Handle nav dropdowns
  navDropdowns.forEach(dropdown => {
    const button = dropdown.querySelector(".dropdown-btn");

    button.addEventListener("click", function (e) {
      e.stopPropagation();
      e.preventDefault();

      // Close other nav dropdowns and profile dropdown
      navDropdowns.forEach(d => {
        if (d !== dropdown) d.classList.remove("active");
      });
      if (profileDropdown) profileDropdown.classList.remove("active");

      // Toggle current dropdown
      dropdown.classList.toggle("active");
    });
  });

  // Profile dropdown click handler
  if (profileBtn && profileDropdown) {
    profileBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        e.preventDefault();

        // Close all nav dropdowns
        navDropdowns.forEach(d => d.classList.remove("active"));

        // Toggle profile dropdown
        profileDropdown.classList.toggle("active");

        // For mobile: close other dropdowns when opening profile
        if (window.innerWidth <= 768) {
            navDropdowns.forEach(d => {
                if (d.classList.contains('active')) {
                d.classList.remove('active');
                }
            });
        }
    });
  }

  // Close everything if clicking outside (for desktop)
  document.addEventListener("click", (e) => {
    if (window.innerWidth > 768) {
      if (!e.target.closest('.nav-dropdown') && !e.target.closest('.profile-dropdown')) {
        navDropdowns.forEach(d => d.classList.remove("active"));
        if (profileDropdown) profileDropdown.classList.remove("active");
      }
    }
  });

  // Close mobile menu when clicking on nav links
  document.querySelectorAll('.nav-center a, .profile-menu a').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        closeMobileMenu();
      }
    });
  });

  // Handle window resize
  window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
      closeMobileMenu();
    }
  });

  // Initialize notification system
  addNotificationStyles();
  initializeNotificationSystem();
});

// Image Modal Functionality
function showImageModal(imageSrc) {
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <span class="image-modal-close" onclick="closeImageModal()">&times;</span>
        <img src="${imageSrc}" class="image-modal-content" alt="Order Image">
    `;
    document.body.appendChild(modal);
    
    // Close on background click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeImageModal();
        }
    });
    
    // Close on Escape key
    document.addEventListener('keydown', function closeOnEscape(e) {
        if (e.key === 'Escape') {
            closeImageModal();
            document.removeEventListener('keydown', closeOnEscape);
        }
    });
}

function closeImageModal() {
    const modal = document.querySelector('.image-modal');
    if (modal) {
        modal.remove();
    }
}

// Your existing order management functions
function approveOrder(orderId) {
    // Your existing approve logic
    console.log('Approving order:', orderId);
}

function rejectOrder(orderId) {
    // Your existing reject logic
    console.log('Rejecting order:', orderId);
}

/* Initialize ingredient bars */
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.ingredient-fill').forEach(fill => {
        const width = fill.dataset.width || '0';
        fill.style.setProperty('--fill-width', width + '%');
    });
});