/**
 * FarmDirect Sales Reports Module
 * Calculates sales metrics from completed orders, renders interactive native SVG charts,
 * category distributions, product ranking, and daily/monthly summaries.
 */

const ReportsModule = {
  init() {
    // Can bind date range filters or export buttons
  },

  async render() {
    const orders = await FarmDirectDB.getOrders();
    const completedOrders = orders.filter((o) => o.status === 'completed');

    // 1. Calculate Aggregate Numbers
    const completedCount = completedOrders.length;
    let totalRevenue = 0;
    let totalItemsVolume = 0;

    const productSalesMap = {}; // productId -> { name, unit, unitsSold, revenue, orderCount }
    const categorySalesMap = {}; // categoryName -> { revenue, unitsSold }
    const dailySalesMap = {}; // YYYY-MM-DD -> { revenue, orderCount }

    completedOrders.forEach((ord) => {
      totalRevenue += ord.totalAmount || 0;

      // Group by Day
      const dayKey = ord.createdAt.split('T')[0];
      if (!dailySalesMap[dayKey]) {
        dailySalesMap[dayKey] = { revenue: 0, orderCount: 0 };
      }
      dailySalesMap[dayKey].revenue += ord.totalAmount || 0;
      dailySalesMap[dayKey].orderCount += 1;

      // Items
      ord.items.forEach((item) => {
        totalItemsVolume += item.quantity || 0;

        // Product Breakdown
        if (!productSalesMap[item.productId]) {
          productSalesMap[item.productId] = {
            id: item.productId,
            name: item.productName,
            unit: item.unit || 'unit',
            unitsSold: 0,
            revenue: 0,
            orderCount: 0
          };
        }
        productSalesMap[item.productId].unitsSold += item.quantity;
        productSalesMap[item.productId].revenue += item.subtotal;
        productSalesMap[item.productId].orderCount += 1;
      });
    });

    const avgOrderValue = completedCount > 0 ? totalRevenue / completedCount : 0;

    // Update KPI Displays
    const elRev = document.getElementById('report-total-revenue');
    const elCount = document.getElementById('report-completed-count');
    const elAov = document.getElementById('report-avg-order-value');
    const elVol = document.getElementById('report-total-volume');

    if (elRev) elRev.innerText = `₹${totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (elCount) elCount.innerText = completedCount;
    if (elAov) elAov.innerText = `₹${avgOrderValue.toFixed(2)}`;
    if (elVol) elVol.innerText = `${totalItemsVolume.toLocaleString()} units`;

    // 2. Render Native SVG Bar Chart (Last 7 Days Sales Trend)
    this.renderSvgDailySalesChart(dailySalesMap);

    // 3. Render Product Sales Ranking
    this.renderTopProductsTable(Object.values(productSalesMap));

    // 4. Render Category Distribution
    await this.renderCategoryBreakdown(completedOrders);
  },

  renderSvgDailySalesChart(dailySalesMap) {
    const chartContainer = document.getElementById('report-chart-container');
    if (!chartContainer) return;

    // Generate last 7 days keys
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const key = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
      days.push({ key, label, ... (dailySalesMap[key] || { revenue: 0, orderCount: 0 }) });
    }

    const maxRev = Math.max(...days.map((d) => d.revenue), 500); // min ceiling of 500 for scale
    const svgWidth = 600;
    const svgHeight = 220;
    const padX = 50;
    const padY = 30;
    const chartW = svgWidth - padX * 2;
    const chartH = svgHeight - padY * 2;
    const barWidth = Math.floor(chartW / days.length) - 18;

    // Generate grid lines
    const gridLevels = [0, 0.25, 0.5, 0.75, 1];
    const gridLines = gridLevels
      .map((lvl) => {
        const y = padY + chartH - lvl * chartH;
        const val = Math.round(lvl * maxRev);
        return `
          <line x1="${padX}" y1="${y}" x2="${svgWidth - padX}" y2="${y}" stroke="#e5e7eb" stroke-dasharray="3,3" />
          <text x="${padX - 8}" y="${y + 4}" fill="#9ca3af" font-size="10" text-anchor="end">₹${val}</text>
        `;
      })
      .join('');

    // Generate Bars
    const barsHtml = days
      .map((d, idx) => {
        const x = padX + idx * (chartW / days.length) + 9;
        const barH = Math.max(d.revenue > 0 ? 6 : 2, (d.revenue / maxRev) * chartH);
        const y = padY + chartH - barH;
        const isToday = idx === days.length - 1;

        return `
          <g class="chart-bar-group" tabindex="0">
            <rect 
              x="${x}" 
              y="${y}" 
              width="${barWidth}" 
              height="${barH}" 
              rx="4" 
              fill="${isToday ? '#2d6a4f' : '#52b788'}"
              class="chart-bar-rect"
            >
              <title>${d.label}: ₹${d.revenue.toFixed(2)} (${d.orderCount} orders)</title>
            </rect>
            ${d.revenue > 0 ? `
              <text x="${x + barWidth / 2}" y="${y - 6}" fill="#2d6a4f" font-size="10" font-weight="bold" text-anchor="middle">₹${Math.round(d.revenue)}</text>
            ` : ''}
            <text x="${x + barWidth / 2}" y="${svgHeight - 8}" fill="#6b7280" font-size="10" text-anchor="middle">${d.label}</text>
          </g>
        `;
      })
      .join('');

    chartContainer.innerHTML = `
      <svg viewBox="0 0 ${svgWidth} ${svgHeight}" class="report-svg-chart" style="width: 100%; height: 220px;">
        ${gridLines}
        ${barsHtml}
      </svg>
    `;
  },

  renderTopProductsTable(productSalesList) {
    const tbody = document.getElementById('report-top-products-tbody');
    if (!tbody) return;

    if (productSalesList.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center py-4 text-muted">No completed orders yet to compute product sales.</td>
        </tr>
      `;
      return;
    }

    // Sort by revenue descending
    const sorted = [...productSalesList].sort((a, b) => b.revenue - a.revenue);

    tbody.innerHTML = sorted
      .map((item, idx) => `
        <tr>
          <td><span class="rank-badge">${idx + 1}</span></td>
          <td><strong>${item.name}</strong></td>
          <td class="text-right font-medium">${item.unitsSold} ${item.unit}</td>
          <td class="text-right text-muted">${item.orderCount}</td>
          <td class="text-right font-bold text-success">₹${item.revenue.toFixed(2)}</td>
        </tr>
      `)
      .join('');
  },

  async renderCategoryBreakdown(completedOrders) {
    const container = document.getElementById('report-category-bars');
    if (!container) return;

    const products = await FarmDirectDB.getProducts();
    const prodCatMap = {};
    products.forEach((p) => {
      prodCatMap[p.id] = p.category;
    });

    const categoryRevenue = {};
    let totalRev = 0;

    completedOrders.forEach((ord) => {
      ord.items.forEach((item) => {
        const cat = prodCatMap[item.productId] || 'Other';
        categoryRevenue[cat] = (categoryRevenue[cat] || 0) + item.subtotal;
        totalRev += item.subtotal;
      });
    });

    const categories = Object.keys(categoryRevenue);
    if (categories.length === 0 || totalRev === 0) {
      container.innerHTML = '<p class="text-muted text-sm">No categorical sales recorded yet.</p>';
      return;
    }

    container.innerHTML = categories
      .map((cat) => {
        const rev = categoryRevenue[cat];
        const pct = Math.round((rev / totalRev) * 100);
        return `
          <div class="category-progress-item">
            <div class="cat-bar-header">
              <span class="font-medium">${cat}</span>
              <span class="text-muted font-bold">₹${rev.toFixed(2)} (${pct}%)</span>
            </div>
            <div class="cat-bar-track">
              <div class="cat-bar-fill" style="width: ${pct}%;"></div>
            </div>
          </div>
        `;
      })
      .join('');
  }
};

window.ReportsModule = ReportsModule;
