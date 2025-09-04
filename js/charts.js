// Charts functionality for BEL Portal
let payoutChartInstance = null; // To hold the chart instance
let annualSalesChartInstance = null; // To hold the annual sales chart instance
let productCategoryChartInstance = null; // To hold the product category chart instance

function initializeCharts() {
    // Initialize dashboard charts if on dashboard page
    if (window.location.pathname.split('/').pop() === 'index.html' || 
        window.location.pathname.split('/').pop() === '') {
        initializeDashboardCharts();
    }
}

async function initializeDashboardCharts() {
    try {
        const performance = await window.dataLoader.loadAnnualPerformance();
        const productAnalysis = await window.dataLoader.loadProductAnalysis();
        
        // Annual Sales Chart
        if (performance) {
            createAnnualSalesChart(performance);
        }
        
        // Product Category Chart  
        if (productAnalysis) {
            createProductCategoryChart(productAnalysis);
        }
        
        // Setup year selector
        setupYearSelector(performance);
        
    } catch (error) {
        console.error('Error initializing dashboard charts:', error);
    }
}

function createAnnualSalesChart(performanceData) {
    const annualSalesCanvas = document.getElementById('annual-sales-chart');
    if (annualSalesCanvas) {
        // Get current year data (default to 2025)
        const currentYear = document.getElementById('year-select')?.value || '2025';
        const yearData = performanceData.yearlyData[currentYear];
        
        if (yearData) {
            if (annualSalesChartInstance) {
                annualSalesChartInstance.destroy();
            }
            
            annualSalesChartInstance = new Chart(annualSalesCanvas, {
                type: 'line',
                data: {
                    labels: yearData.months,
                    datasets: [{
                        label: 'Sales ($)',
                        data: yearData.salesData,
                        tension: 0.4,
                        borderColor: 'rgb(0, 110, 255)',
                        backgroundColor: 'rgba(0, 110, 255, 0.1)',
                        fill: true,
                        orderVolume: yearData.ordersData
                    }]
                },
                options: { 
                    responsive: true, 
                    maintainAspectRatio: false, 
                    scales: { y: { beginAtZero: true } }, 
                    plugins: { 
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: (context) => `Sales: $${context.parsed.y.toLocaleString()}`,
                                afterLabel: (context) => `Orders: ${context.dataset.orderVolume[context.dataIndex]}`
                            }
                        }
                    } 
                }
            });
        }
    }
}

function createProductCategoryChart(productAnalysis) {
    const productCategoryCanvas = document.getElementById('product-category-chart');
    if (productCategoryCanvas && productAnalysis.topCategories) {
        if (productCategoryChartInstance) {
            productCategoryChartInstance.destroy();
        }
        
        const categories = productAnalysis.topCategories;
        const labels = categories.map(cat => cat.category);
        const data = categories.map(cat => cat.sales);
        const colors = categories.map((cat, index) => `hsl(${210 + index * 30}, 70%, 50%)`);
        
        productCategoryChartInstance = new Chart(productCategoryCanvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Sales ($)',
                    data: data,
                    tension: 0.4,
                    borderColor: 'rgb(0, 110, 255)',
                    backgroundColor: 'rgba(0, 110, 255, 0.1)',
                    fill: true,
                    borderRadius: 4
                }]
            },
            options: { 
                responsive: true, 
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: { 
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (context) => `Sales: $${context.parsed.x.toLocaleString()}`
                        }
                    }
                }, 
                scales: { x: { beginAtZero: true } } 
            }
        });
    }
}

function setupYearSelector(performanceData) {
    const yearSelect = document.getElementById('year-select');
    if (yearSelect && performanceData) {
        yearSelect.addEventListener('change', (e) => {
            const selectedYear = e.target.value;
            const yearData = performanceData.yearlyData[selectedYear];
            
            if (yearData && annualSalesChartInstance) {
                // Update chart data
                annualSalesChartInstance.data.labels = yearData.months;
                annualSalesChartInstance.data.datasets[0].data = yearData.salesData;
                annualSalesChartInstance.data.datasets[0].orderVolume = yearData.ordersData;
                annualSalesChartInstance.update();
            }
        });
    }
}

// Payout History Chart
function renderPayoutChart() {
    const payoutHistoryCanvas = document.getElementById('payout-history-chart');
    if (!payoutHistoryCanvas) return;

    if (payoutChartInstance) {
        payoutChartInstance.destroy(); // Destroy previous instance if it exists
    }

    // Get data from the table dynamically
    const tableRows = document.querySelectorAll('#payout-history-table tbody tr');
    const payoutData = Array.from(tableRows).map(row => {
        const dateCell = row.children[1].textContent.trim();
        const payoutCell = row.children[5].textContent.trim();
        return {
            date: dateCell,
            payout: parseFloat(payoutCell.replace(/[^0-9.-]+/g, ""))
        };
    }).reverse(); // Reverse to show oldest first

    const labels = payoutData.map(d => new Date(d.date).toLocaleString('default', { month: 'short', year: 'numeric' }));
    const data = payoutData.map(d => d.payout);

    payoutChartInstance = new Chart(payoutHistoryCanvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Net Payout (USD)',
                data: data,
                backgroundColor: 'rgba(0, 110, 255, 0.8)',
                borderColor: 'rgba(0, 110, 255, 1)',
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value;
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Net Payout: $${context.parsed.y.toLocaleString('en-US')}`;
                        }
                    }
                }
            }
        }
    });
}

// Initialize charts when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add a delay to ensure data is loaded first
    setTimeout(initializeCharts, 500);
});
