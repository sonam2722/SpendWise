/* =========================================
   SPENDWISE - STUDENT EXPENSE TRACKER
   ========================================= */


/* =========================================
   DATA
   ========================================= */
let expenses = JSON.parse(localStorage.getItem("spendwise")) || [];
 
/* =========================================
   DOM ELEMENTS
   ========================================= */

const expenseForm = document.getElementById("expenseForm");

const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");

const searchInput = document.getElementById("searchInput");
const monthFilter = document.getElementById("monthFilter");
const fromDateInput = document.getElementById("fromDate");
const toDateInput = document.getElementById("toDate");

const applyDateFilterBtn =
    document.getElementById("applyDateFilterBtn");

const resetFiltersBtn =
    document.getElementById("resetFiltersBtn");

const list = document.getElementById("list");
const resultSummary = document.getElementById("resultSummary");

const totalElement = document.getElementById("total");
const countElement = document.getElementById("count");
const averageElement = document.getElementById("average");

const highestMonthElement =
    document.getElementById("highestMonth");

const highestMonthAmountElement =
    document.getElementById("highestMonthAmount");

const monthlyList =
    document.getElementById("monthlyList");

const currentMonthElement =
    document.getElementById("currentMonth");

const categoryList =
    document.getElementById("categoryList");

const chartCanvas =
    document.getElementById("expenseChart");

const monthlyChartCanvas =
    document.getElementById("monthlyChart");

const monthlyTotalElement =
    document.getElementById("monthlyTotal");

const chartDetails =
    document.getElementById("chartDetails");

const clearBtn =
    document.getElementById("clearBtn");

const exportBtn =
    document.getElementById("exportBtn");

const themeBtn =
    document.getElementById("themeBtn");

const incomeInput =
    document.getElementById("incomeInput");

const budgetInput =
    document.getElementById("budgetInput");

const goalInput =
    document.getElementById("goalInput");

const saveFinanceBtn =
    document.getElementById("saveFinanceBtn");

const remainingBudgetElement =
    document.getElementById("remainingBudget");

const savingsElement =
    document.getElementById("savings");

const goalProgressElement =
    document.getElementById("goalProgress");

    const highestExpenseEl =
    document.getElementById("highestExpense");

const highestExpenseTitleEl =
    document.getElementById("highestExpenseTitle");

const lowestExpenseEl =
    document.getElementById("lowestExpense");

const lowestExpenseTitleEl =
    document.getElementById("lowestExpenseTitle");

const averageDailyEl =
    document.getElementById("averageDaily");

const topCategoryEl =
    document.getElementById("topCategory");

const topCategoryAmountEl =
    document.getElementById("topCategoryAmount");

const insightsListEl =
    document.getElementById("insightsList");

    const reminderList = document.getElementById("reminderList");

let reminders =
    JSON.parse(localStorage.getItem("spendwiseReminders")) || [];

/* =========================================
   HELPERS
   ========================================= */

function formatCurrency(amount) {
    return "₹" + Number(amount).toLocaleString("en-IN");
}


function escapeHTML(value) {
    const div = document.createElement("div");
    div.textContent = value;
    return div.innerHTML;
}


/*
   Local date helper.
   This avoids the UTC date problem that can happen
   when using new Date().toISOString() directly.
*/
function getLocalDateString(date = new Date()) {

    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function formatMonth(monthKey) {

    if (!monthKey) {
        return "";
    }

    const [year, month] = monthKey.split("-");

    const date = new Date(
        Number(year),
        Number(month) - 1,
        1
    );

    return date.toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric"
    });
}


function formatDate(dateString) {

    if (!dateString) {
        return "";
    }

    const [year, month, day] =
        dateString.split("-");

    const date = new Date(
        Number(year),
        Number(month) - 1,
        Number(day)
    );

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}


/* =========================================
   LOCAL STORAGE
   ========================================= */

function saveExpenses() {

    localStorage.setItem(
        "spendwise",
        JSON.stringify(expenses)
    );
}


/* =========================================
   FILTERED EXPENSES
   ========================================= */

function getFilteredExpenses() {

    const searchTerm =
        searchInput.value
            .trim()
            .toLowerCase();

    const selectedMonth =
        monthFilter.value;

    const fromDate =
        fromDateInput.value;

    const toDate =
        toDateInput.value;

    return expenses.filter(expense => {

        const matchesSearch =
            expense.title
                .toLowerCase()
                .includes(searchTerm) ||

            expense.category
                .toLowerCase()
                .includes(searchTerm);

        const matchesMonth =
            selectedMonth === "all" ||
            expense.date.startsWith(selectedMonth);

        const matchesFromDate =
            !fromDate ||
            expense.date >= fromDate;

        const matchesToDate =
            !toDate ||
            expense.date <= toDate;

        return (
            matchesSearch &&
            matchesMonth &&
            matchesFromDate &&
            matchesToDate
        );
    });
}

/* =========================================
   MONTH FILTER
   ========================================= */

function updateMonthFilter() {

    const currentValue =
        monthFilter.value;

    const months = [
        ...new Set(
            expenses.map(expense =>
                expense.date.slice(0, 7)
            )
        )
    ].sort().reverse();


    monthFilter.innerHTML = `
        <option value="all">
            All Months
        </option>
    `;


    months.forEach(month => {

        const option =
            document.createElement("option");

        option.value = month;
        option.textContent =
            formatMonth(month);

        monthFilter.appendChild(option);
    });


    if (
        months.includes(currentValue)
    ) {
        monthFilter.value = currentValue;
    } else {
        monthFilter.value = "all";
    }
}
applyDateFilterBtn.addEventListener(
    "click",
    function () {

        if (
            fromDateInput.value &&
            toDateInput.value &&
            fromDateInput.value > toDateInput.value
        ) {

            alert(
                "From date cannot be later than To date."
            );

            return;
        }

        render();
    }
);resetFiltersBtn.addEventListener(
    "click",
    function () {

        searchInput.value = "";

        monthFilter.value = "all";

        fromDateInput.value = "";

        toDateInput.value = "";

        render();
    }
);

/* =========================================
   MAIN RENDER
   ========================================= */

function render() {

    const filteredExpenses =
        getFilteredExpenses();


    /* -------------------------
       EXPENSE LIST
    ------------------------- */

    list.innerHTML = "";


    if (filteredExpenses.length === 0) {

        list.innerHTML = `
            <div class="empty-state">
                No expenses found.
            </div>
        `;

    } else {

        filteredExpenses
            .slice()
            .sort((a, b) =>
                b.date.localeCompare(a.date)
            )
            .forEach(expense => {

                const item =
                    document.createElement("div");

                item.className =
                    "expense-item";

                item.innerHTML = `
                    <div class="expense-info">

                        <h3>
                            ${escapeHTML(expense.title)}
                        </h3>

                        <p>
                            ${escapeHTML(expense.category)}
                            •
                            ${formatDate(expense.date)}
                        </p>

                    </div>

                    <div class="expense-amount">
                        ${formatCurrency(expense.amount)}
                    </div>

                    <div class="expense-buttons">

                        <button
                            class="edit-btn"
                            onclick="editExpense(${expense.id})"
                        >
                            ✏️ Edit
                        </button>

                        <button
                            class="delete-btn"
                            onclick="deleteExpense(${expense.id})"
                        >
                            🗑️ Delete
                        </button>

                    </div>
                `;

                list.appendChild(item);
            });
    }


    /* -------------------------
       RESULT SUMMARY
    ------------------------- */

    resultSummary.textContent =
        `${filteredExpenses.length} expense${
            filteredExpenses.length === 1
                ? ""
                : "s"
        } found`;


    /* -------------------------
       DASHBOARD
    ------------------------- */

    const total =
        filteredExpenses.reduce(
            (sum, expense) =>
                sum + Number(expense.amount),
            0
        );

    const count =
        filteredExpenses.length;

    const average =
        count > 0
            ? total / count
            : 0;


    totalElement.textContent =
        formatCurrency(total);

    countElement.textContent =
        count;

    averageElement.textContent =
        formatCurrency(Math.round(average));


    /* -------------------------
       OTHER SECTIONS
    ------------------------- */

    renderHighestSpendingMonth();

    renderMonthlyExpenses();

    renderCategorySummary();

    renderChart();

    renderMonthlyChart();

    renderFinanceOverview();

    renderSmartAnalytics();

    renderCategoryChart();

    renderYearlyChart();
}


/* =========================================
   HIGHEST SPENDING MONTH
   ========================================= */

function renderHighestSpendingMonth() {

    if (expenses.length === 0) {

        highestMonthElement.textContent =
            "—";

        highestMonthAmountElement.textContent =
            "₹0";

        return;
    }


    const monthlyTotals = {};


    expenses.forEach(expense => {

        const month =
            expense.date.slice(0, 7);

        monthlyTotals[month] =
            (monthlyTotals[month] || 0) +
            Number(expense.amount);
    });


    const highestMonth =
        Object.entries(monthlyTotals)
            .sort((a, b) => b[1] - a[1])[0];


    if (!highestMonth) {
        return;
    }


    highestMonthElement.textContent =
        formatMonth(highestMonth[0]);

    highestMonthAmountElement.textContent =
        formatCurrency(highestMonth[1]);
}


/* =========================================
   ADD EXPENSE
   ========================================= */

expenseForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const title =
            titleInput.value.trim();

        const amount =
            Number(amountInput.value);

        const category =
            categoryInput.value;


        if (!title || amount <= 0 || !category) {

            alert(
                "Please enter valid expense details."
            );

            return;
        }


        const expense = {

            id: Date.now(),

            title: title,

            amount: amount,

            category: category,

            date: getLocalDateString()
        };


        expenses.push(expense);

        saveExpenses();

        expenseForm.reset();

        updateMonthFilter();

        render();
    }
);


/* =========================================
   DELETE EXPENSE
   ========================================= */

function deleteExpense(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this expense?"
        );

    if (!confirmed) {
        return;
    }


    expenses =
        expenses.filter(
            expense =>
                expense.id !== id
        );


    saveExpenses();

    updateMonthFilter();

    render();
}


/* =========================================
   EDIT EXPENSE
   ========================================= */

function editExpense(id) {

    const expense =
        expenses.find(
            item => item.id === id
        );

    if (!expense) {
        return;
    }


    const newTitle =
        prompt(
            "Enter expense title:",
            expense.title
        );


    if (newTitle === null) {
        return;
    }


    const newAmount =
        prompt(
            "Enter amount:",
            expense.amount
        );


    if (newAmount === null) {
        return;
    }


    const amount =
        Number(newAmount);


    if (
        !newTitle.trim() ||
        isNaN(amount) ||
        amount <= 0
    ) {

        alert(
            "Please enter valid details."
        );

        return;
    }


    expense.title =
        newTitle.trim();

    expense.amount =
        amount;


    saveExpenses();

    render();
}


/* =========================================
   SEARCH
   ========================================= */

searchInput.addEventListener(
    "input",
    render
);


/* =========================================
   MONTH FILTER
   ========================================= */

monthFilter.addEventListener(
    "change",
    render
);


/* =========================================
   MONTHLY EXPENSES
   ========================================= */

function renderMonthlyExpenses() {

    monthlyList.innerHTML = "";


    if (expenses.length === 0) {

        monthlyList.innerHTML = `
            <div class="empty-state">
                No monthly expense data available.
            </div>
        `;

        currentMonthElement.textContent =
            "No data available";

        return;
    }


    const monthlyTotals = {};


    expenses.forEach(expense => {

        const month =
            expense.date.slice(0, 7);

        monthlyTotals[month] =
            (monthlyTotals[month] || 0) +
            Number(expense.amount);
    });


    const months =
        Object.keys(monthlyTotals)
            .sort()
            .reverse();


    currentMonthElement.textContent =
        formatMonth(months[0]);


    months.forEach(month => {

        const row =
            document.createElement("div");

        row.className =
            "month-row";

        row.innerHTML = `
            <span>
                ${formatMonth(month)}
            </span>

            <strong>
                ${formatCurrency(
                    monthlyTotals[month]
                )}
            </strong>
        `;

        monthlyList.appendChild(row);
    });
}


/* =========================================
   CATEGORY SUMMARY
   ========================================= */

function renderCategorySummary() {

    categoryList.innerHTML = "";


    if (expenses.length === 0) {

        categoryList.innerHTML = `
            <div class="empty-state">
                No category data available.
            </div>
        `;

        return;
    }


    const categoryTotals = {};


    expenses.forEach(expense => {

        categoryTotals[expense.category] =
            (categoryTotals[expense.category] || 0) +
            Number(expense.amount);
    });


    const categories =
        Object.entries(categoryTotals)
            .sort((a, b) => b[1] - a[1]);


    categories.forEach(
        ([category, total]) => {

            const row =
                document.createElement("div");

            row.className =
                "category-row";

            row.innerHTML = `
                <span>
                    ${escapeHTML(category)}
                </span>

                <strong>
                    ${formatCurrency(total)}
                </strong>
            `;

            categoryList.appendChild(row);
        }
    );
}


/* =========================================
   DAILY CHART
   ========================================= */

function renderChart() {

    if (!chartCanvas) {
        return;
    }


    const ctx =
        chartCanvas.getContext("2d");


    ctx.clearRect(
        0,
        0,
        chartCanvas.width,
        chartCanvas.height
    );


    if (expenses.length === 0) {

        ctx.font =
            "16px Arial";

        ctx.fillStyle =
            "#6b7280";

        ctx.textAlign =
            "center";

        ctx.fillText(
            "Add expenses to see the chart",
            chartCanvas.width / 2,
            chartCanvas.height / 2
        );

        return;
    }


    const dailyTotals = {};


    expenses.forEach(expense => {

        dailyTotals[expense.date] =
            (dailyTotals[expense.date] || 0) +
            Number(expense.amount);
    });


    const dates =
        Object.keys(dailyTotals)
            .sort()
            .slice(-10);


    const maxValue =
        Math.max(
            ...dates.map(
                date => dailyTotals[date]
            )
        );


    const chartWidth =
        chartCanvas.width;

    const chartHeight =
        chartCanvas.height;

    const padding = 50;

    const bottomPadding = 50;

    const availableWidth =
        chartWidth - padding * 2;

    const availableHeight =
        chartHeight -
        padding -
        bottomPadding;


    const barGap = 15;

    const barWidth =
        Math.max(
            20,
            (
                availableWidth -
                barGap * (dates.length - 1)
            ) / dates.length
        );


    dates.forEach(
        (date, index) => {

            const value =
                dailyTotals[date];


            const barHeight =
                maxValue > 0
                    ? (
                        value / maxValue
                    ) * availableHeight
                    : 0;


            const x =
                padding +
                index *
                (barWidth + barGap);


            const y =
                chartHeight -
                bottomPadding -
                barHeight;


            ctx.fillStyle =
                "#6366f1";

            ctx.fillRect(
                x,
                y,
                barWidth,
                barHeight
            );


            ctx.fillStyle =
                "#374151";

            ctx.font =
                "12px Arial";

            ctx.textAlign =
                "center";

            ctx.fillText(
                formatCurrency(value),
                x + barWidth / 2,
                y - 8
            );


            ctx.fillText(
                date.slice(5),
                x + barWidth / 2,
                chartHeight - 25
            );
        }
    );


    chartCanvas.onclick =
        function (event) {

            const rect =
                chartCanvas.getBoundingClientRect();

            const scaleX =
                chartCanvas.width /
                rect.width;

            const mouseX =
                (event.clientX - rect.left) *
                scaleX;


            dates.forEach(
                (date, index) => {

                    const x =
                        padding +
                        index *
                        (barWidth + barGap);


                    if (
                        mouseX >= x &&
                        mouseX <= x + barWidth
                    ) {

                        const selectedExpenses =
                            expenses.filter(
                                expense =>
                                    expense.date === date
                            );


                        showChartDetails(
                            formatDate(date),
                            selectedExpenses
                        );
                    }
                }
            );
        };
}


/* =========================================
   MONTHLY CHART
   ========================================= */

function renderMonthlyChart() {

    if (!monthlyChartCanvas) {
        return;
    }


    const ctx =
        monthlyChartCanvas.getContext("2d");


    ctx.clearRect(
        0,
        0,
        monthlyChartCanvas.width,
        monthlyChartCanvas.height
    );


    if (expenses.length === 0) {

        monthlyTotalElement.textContent =
            "₹0";


        ctx.font =
            "16px Arial";

        ctx.fillStyle =
            "#6b7280";

        ctx.textAlign =
            "center";

        ctx.fillText(
            "Add expenses to see the monthly chart",
            monthlyChartCanvas.width / 2,
            monthlyChartCanvas.height / 2
        );

        return;
    }


    const monthlyTotals = {};


    expenses.forEach(expense => {

        const month =
            expense.date.slice(0, 7);

        monthlyTotals[month] =
            (monthlyTotals[month] || 0) +
            Number(expense.amount);
    });


    const months =
        Object.keys(monthlyTotals)
            .sort()
            .slice(-6);


    const currentMonthKey =
        getLocalDateString().slice(0, 7);


    const currentMonthAmount =
        monthlyTotals[currentMonthKey] || 0;


    monthlyTotalElement.textContent =
        formatCurrency(currentMonthAmount);


    const maxValue =
        Math.max(
            ...months.map(
                month =>
                    monthlyTotals[month]
            )
        );


    const chartWidth =
        monthlyChartCanvas.width;

    const chartHeight =
        monthlyChartCanvas.height;

    const padding = 55;

    const bottomPadding = 65;

    const availableWidth =
        chartWidth - padding * 2;

    const availableHeight =
        chartHeight -
        padding -
        bottomPadding;


    const barGap = 25;

    const barWidth =
        Math.max(
            35,
            (
                availableWidth -
                barGap * (months.length - 1)
            ) / months.length
        );


    months.forEach(
        (month, index) => {

            const value =
                monthlyTotals[month];


            const barHeight =
                maxValue > 0
                    ? (
                        value / maxValue
                    ) * availableHeight
                    : 0;


            const x =
                padding +
                index *
                (barWidth + barGap);


            const y =
                chartHeight -
                bottomPadding -
                barHeight;


            ctx.fillStyle =
                "#7c3aed";

            ctx.fillRect(
                x,
                y,
                barWidth,
                barHeight
            );


            ctx.fillStyle =
                "#374151";

            ctx.font =
                "12px Arial";

            ctx.textAlign =
                "center";


            ctx.fillText(
                formatCurrency(value),
                x + barWidth / 2,
                y - 8
            );


            const shortMonth =
                formatMonth(month)
                    .split(" ")[0]
                    .slice(0, 3);


            ctx.fillText(
                shortMonth,
                x + barWidth / 2,
                chartHeight - 30
            );


            ctx.fillText(
                month.slice(0, 4),
                x + barWidth / 2,
                chartHeight - 15
            );
        }
    );


    monthlyChartCanvas.onclick =
        function (event) {

            const rect =
                monthlyChartCanvas
                    .getBoundingClientRect();

            const scaleX =
                monthlyChartCanvas.width /
                rect.width;

            const mouseX =
                (event.clientX - rect.left) *
                scaleX;


            months.forEach(
                (month, index) => {

                    const x =
                        padding +
                        index *
                        (barWidth + barGap);


                    if (
                        mouseX >= x &&
                        mouseX <= x + barWidth
                    ) {

                        const selectedExpenses =
                            expenses.filter(
                                expense =>
                                    expense.date
                                        .startsWith(month)
                            );


                        showChartDetails(
                            formatMonth(month),
                            selectedExpenses
                        );
                    }
                }
            );
        };
}


/* =========================================
   FINANCE OVERVIEW
   ========================================= */

function renderFinanceOverview() {

    const income =
        Number(
            localStorage.getItem(
                "spendwiseIncome"
            )
        ) || 0;


    const budget =
        Number(
            localStorage.getItem(
                "spendwiseBudget"
            )
        ) || 0;


    const goal =
        Number(
            localStorage.getItem(
                "spendwiseGoal"
            )
        ) || 0;


    const currentMonth =
        getLocalDateString().slice(0, 7);


    const monthlySpent =
        expenses
            .filter(expense =>
                expense.date.startsWith(
                    currentMonth
                )
            )
            .reduce(
                (sum, expense) =>
                    sum + Number(expense.amount),
                0
            );


    const remainingBudget =
        budget - monthlySpent;


    const savings =
        income - monthlySpent;


    let goalProgress = 0;


    if (goal > 0) {

        goalProgress =
            Math.min(
                100,
                Math.max(
                    0,
                    (savings / goal) * 100
                )
            );
    }


    remainingBudgetElement.textContent =
        formatCurrency(remainingBudget);

    savingsElement.textContent =
        formatCurrency(savings);

    goalProgressElement.textContent =
        `${Math.round(goalProgress)}%`;
}


/* =========================================
   SAVE FINANCE SETTINGS
   ========================================= */

saveFinanceBtn.addEventListener(
    "click",
    function () {

        const income =
            Number(incomeInput.value) || 0;

        const budget =
            Number(budgetInput.value) || 0;

        const goal =
            Number(goalInput.value) || 0;


        localStorage.setItem(
            "spendwiseIncome",
            income
        );

        localStorage.setItem(
            "spendwiseBudget",
            budget
        );

        localStorage.setItem(
            "spendwiseGoal",
            goal
        );


        renderFinanceOverview();


        alert(
            "Finance settings saved successfully!"
        );
    }
);


/* =========================================
   LOAD FINANCE
   ========================================= */

function loadFinance() {

    incomeInput.value =
        localStorage.getItem(
            "spendwiseIncome"
        ) || "";

    budgetInput.value =
        localStorage.getItem(
            "spendwiseBudget"
        ) || "";

    goalInput.value =
        localStorage.getItem(
            "spendwiseGoal"
        ) || "";
}


/* =========================================
   CLEAR ALL EXPENSES
   ========================================= */

clearBtn.addEventListener(
    "click",
    function () {

        if (expenses.length === 0) {

            alert(
                "There are no expenses to clear."
            );

            return;
        }


        const confirmed =
            confirm(
                "This will delete all expenses. Continue?"
            );


        if (!confirmed) {
            return;
        }


        expenses = [];

        saveExpenses();

        updateMonthFilter();

        render();
    }
);


/* =========================================
   EXPORT CSV
   ========================================= */

exportBtn.addEventListener(
    "click",
    function () {

        if (expenses.length === 0) {

            alert(
                "No expenses available to export."
            );

            return;
        }


        let csv =
            "Title,Amount,Category,Date\n";


        expenses.forEach(expense => {

            const title =
                `"${expense.title.replace(
                    /"/g,
                    '""'
                )}"`;

            csv +=
                `${title},${expense.amount},${expense.category},${expense.date}\n`;
        });


        const blob =
            new Blob(
                [csv],
                {
                    type: "text/csv;charset=utf-8;"
                }
            );


        const url =
            URL.createObjectURL(blob);


        const link =
            document.createElement("a");

        link.href = url;

        link.download =
            "spendwise-expenses.csv";

        link.click();


        URL.revokeObjectURL(url);
    }
);


/* =========================================
   DARK MODE
   ========================================= */

function applyTheme() {

    const darkMode =
        localStorage.getItem(
            "spendwiseTheme"
        ) === "dark";


    document.body.classList.toggle(
        "dark",
        darkMode
    );


    themeBtn.textContent =
        darkMode
            ? "☀️"
            : "🌙";
}


themeBtn.addEventListener(
    "click",
    function () {

        const isDark =
            document.body.classList.toggle(
                "dark"
            );


        localStorage.setItem(
            "spendwiseTheme",
            isDark
                ? "dark"
                : "light"
        );


        themeBtn.textContent =
            isDark
                ? "☀️"
                : "🌙";
    }
);


/* =========================================
   CHART DETAILS
   ========================================= */

function showChartDetails(
    title,
    selectedExpenses
) {

    if (!chartDetails) {
        return;
    }


    if (selectedExpenses.length === 0) {

        chartDetails.innerHTML = `
            <h3>${escapeHTML(title)}</h3>
            <p>No expenses found.</p>
        `;

        return;
    }


    chartDetails.innerHTML = `
        <h3>
            ${escapeHTML(title)}
        </h3>

        <div class="details-list"></div>
    `;


    const detailsList =
        chartDetails.querySelector(
            ".details-list"
        );


    selectedExpenses.forEach(expense => {

        const item =
            document.createElement("div");

        item.className =
            "detail-item";

        item.innerHTML = `
            <span>
                ${escapeHTML(expense.title)}
                <small>
                    (${escapeHTML(expense.category)})
                </small>
            </span>

            <strong>
                ${formatCurrency(expense.amount)}
            </strong>
        `;

        detailsList.appendChild(item);
    });
}


/* =========================================
   START APPLICATION
   ========================================= */

loadFinance();

applyTheme();

updateMonthFilter();

render();

function renderSmartAnalytics() {

    if (expenses.length === 0) {

        highestExpenseEl.textContent = "₹0";
        highestExpenseTitleEl.textContent = "No data";

        lowestExpenseEl.textContent = "₹0";
        lowestExpenseTitleEl.textContent = "No data";

        averageDailyEl.textContent = "₹0";

        topCategoryEl.textContent = "—";
        topCategoryAmountEl.textContent = "₹0";

        insightsListEl.innerHTML = `
            <div class="insight-item">
                💡 Add some expenses to see smart spending insights.
            </div>
        `;

        return;
    }


    /* =========================
       HIGHEST EXPENSE
    ========================= */

    const highestExpense =
        expenses.reduce(
            (max, expense) =>
                Number(expense.amount) > Number(max.amount)
                    ? expense
                    : max
        );

    highestExpenseEl.textContent =
        formatCurrency(highestExpense.amount);

    highestExpenseTitleEl.textContent =
        highestExpense.title;


    /* =========================
       LOWEST EXPENSE
    ========================= */

    const lowestExpense =
        expenses.reduce(
            (min, expense) =>
                Number(expense.amount) < Number(min.amount)
                    ? expense
                    : min
        );

    lowestExpenseEl.textContent =
        formatCurrency(lowestExpense.amount);

    lowestExpenseTitleEl.textContent =
        lowestExpense.title;


    /* =========================
       AVERAGE DAILY SPENDING
    ========================= */

    const totalSpent =
        expenses.reduce(
            (sum, expense) =>
                sum + Number(expense.amount),
            0
        );

    const uniqueDays =
        new Set(
            expenses.map(expense => expense.date)
        ).size;

    const averageDaily =
        uniqueDays > 0
            ? totalSpent / uniqueDays
            : 0;

    averageDailyEl.textContent =
        formatCurrency(averageDaily);


    /* =========================
       TOP CATEGORY
    ========================= */

    const categoryTotals = {};

    expenses.forEach(expense => {

        const category =
            expense.category || "Other";

        categoryTotals[category] =
            (categoryTotals[category] || 0) +
            Number(expense.amount);
    });


    const topCategory =
        Object.entries(categoryTotals)
            .sort((a, b) => b[1] - a[1])[0];


    if (topCategory) {

        topCategoryEl.textContent =
            topCategory[0];

        topCategoryAmountEl.textContent =
            formatCurrency(topCategory[1]);
    }


    /* =========================
       AUTOMATIC INSIGHTS
    ========================= */

    const insights = [];

    insights.push(`
        💸 Your highest single expense is
        <strong>${formatCurrency(highestExpense.amount)}</strong>
        for <strong>${escapeHTML(highestExpense.title)}</strong>.
    `);

    insights.push(`
        🏷️ Your highest spending category is
        <strong>${escapeHTML(topCategory[0])}</strong>
        with total spending of
        <strong>${formatCurrency(topCategory[1])}</strong>.
    `);

    insights.push(`
        📊 Your average spending per recorded day is
        <strong>${formatCurrency(averageDaily)}</strong>.
    `);

    insightsListEl.innerHTML =
        insights
            .map(
                insight =>
                    `<div class="insight-item">${insight}</div>`
            )
            .join("");
}

function renderCategoryChart() {

    const canvas =
        document.getElementById("categoryChart");

    if (!canvas) return;

    const ctx =
        canvas.getContext("2d");

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    if (expenses.length === 0) {

        ctx.font = "16px Arial";
        ctx.textAlign = "center";
        ctx.fillText(
            "No expense data available",
            canvas.width / 2,
            canvas.height / 2
        );

        return;
    }


    /* =========================
       CATEGORY TOTALS
    ========================= */

    const categoryTotals = {};

    expenses.forEach(expense => {

        const category =
            expense.category || "Other";

        categoryTotals[category] =
            (categoryTotals[category] || 0) +
            Number(expense.amount);
    });


    const categories =
        Object.keys(categoryTotals);

    const amounts =
        Object.values(categoryTotals);

    const total =
        amounts.reduce(
            (sum, amount) => sum + amount,
            0
        );


    /* =========================
       CHART AREA
    ========================= */

    const centerX = canvas.width / 2;
    const centerY = 170;

    const radius = 115;

    let startAngle = -Math.PI / 2;


    /* =========================
       DRAW PIE CHART
    ========================= */

    categories.forEach((category, index) => {

        const percentage =
            amounts[index] / total;

        const sliceAngle =
            percentage * Math.PI * 2;

        const endAngle =
            startAngle + sliceAngle;

        ctx.beginPath();

        ctx.moveTo(
            centerX,
            centerY
        );

        ctx.arc(
            centerX,
            centerY,
            radius,
            startAngle,
            endAngle
        );

        ctx.closePath();

        ctx.fillStyle =
            `hsl(${index * 55 + 200}, 70%, 60%)`;

        ctx.fill();

        startAngle = endAngle;
    });


    /* =========================
       CENTER TEXT
    ========================= */

    ctx.fillStyle =
        document.body.classList.contains("dark")
            ? "#ffffff"
            : "#111827";

    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";

    ctx.fillText(
        "Total",
        centerX,
        centerY - 8
    );

    ctx.font = "bold 18px Arial";

    ctx.fillText(
        formatCurrency(total),
        centerX,
        centerY + 18
    );


    /* =========================
       LEGEND
    ========================= */

    let legendY = 30;

    categories.forEach((category, index) => {

        const percentage =
            (amounts[index] / total) * 100;

        const color =
            `hsl(${index * 55 + 200}, 70%, 60%)`;

        ctx.fillStyle = color;

        ctx.fillRect(
            20,
            legendY,
            14,
            14
        );

        ctx.fillStyle =
            document.body.classList.contains("dark")
                ? "#d1d5db"
                : "#374151";

        ctx.font = "13px Arial";
        ctx.textAlign = "left";

        ctx.fillText(
            `${category} (${percentage.toFixed(1)}%)`,
            42,
            legendY + 12
        );

        legendY += 25;
    });
}

function renderYearlyChart() {

    const canvas =
        document.getElementById("yearlyChart");

    if (!canvas) return;

    const ctx =
        canvas.getContext("2d");

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    if (expenses.length === 0) {

        ctx.font = "16px Arial";
        ctx.textAlign = "center";

        ctx.fillText(
            "No expense data available",
            canvas.width / 2,
            canvas.height / 2
        );

        return;
    }


    /* =========================
       YEARLY TOTALS
    ========================= */

    const yearlyTotals = {};

    expenses.forEach(expense => {

        const year =
            expense.date.substring(0, 4);

        yearlyTotals[year] =
            (yearlyTotals[year] || 0) +
            Number(expense.amount);
    });


    const years =
        Object.keys(yearlyTotals).sort();

    const amounts =
        years.map(year => yearlyTotals[year]);


    const maxAmount =
        Math.max(...amounts);


    /* =========================
       CHART SETTINGS
    ========================= */

    const chartLeft = 70;
    const chartRight = 760;
    const chartTop = 30;
    const chartBottom = 300;

    const chartWidth =
        chartRight - chartLeft;

    const chartHeight =
        chartBottom - chartTop;


    /* =========================
       Y AXIS
    ========================= */

    ctx.strokeStyle =
        document.body.classList.contains("dark")
            ? "#4b5563"
            : "#d1d5db";

    ctx.lineWidth = 1;

    ctx.beginPath();

    ctx.moveTo(
        chartLeft,
        chartTop
    );

    ctx.lineTo(
        chartLeft,
        chartBottom
    );

    ctx.lineTo(
        chartRight,
        chartBottom
    );

    ctx.stroke();


    /* =========================
       Y AXIS LABELS
    ========================= */

    ctx.fillStyle =
        document.body.classList.contains("dark")
            ? "#d1d5db"
            : "#374151";

    ctx.font = "12px Arial";
    ctx.textAlign = "right";

    const steps = 5;

    for (let i = 0; i <= steps; i++) {

        const value =
            (maxAmount / steps) * i;

        const y =
            chartBottom -
            (i / steps) * chartHeight;

        ctx.fillText(
            formatCurrency(value),
            chartLeft - 10,
            y + 4
        );
    }


    /* =========================
       BARS
    ========================= */

    const barWidth =
        Math.min(
            70,
            chartWidth / years.length * 0.55
        );

    const gap =
        chartWidth / years.length;


    years.forEach((year, index) => {

        const amount =
            yearlyTotals[year];

        const barHeight =
            maxAmount > 0
                ? (amount / maxAmount) * chartHeight
                : 0;

        const x =
            chartLeft +
            gap * index +
            (gap - barWidth) / 2;

        const y =
            chartBottom - barHeight;


        /* Bar */

        ctx.fillStyle =
            `hsl(${index * 60 + 210}, 70%, 60%)`;

        ctx.fillRect(
            x,
            y,
            barWidth,
            barHeight
        );


        /* Amount */

        ctx.fillStyle =
            document.body.classList.contains("dark")
                ? "#ffffff"
                : "#111827";

        ctx.font = "bold 12px Arial";
        ctx.textAlign = "center";

        ctx.fillText(
            formatCurrency(amount),
            x + barWidth / 2,
            y - 8
        );


        /* Year */

        ctx.font = "13px Arial";

        ctx.fillText(
            year,
            x + barWidth / 2,
            chartBottom + 22
        );
    });
}
function renderSmartAnalytics() {

    if (expenses.length === 0) {
        return;
    }

    const totalSpent = expenses.reduce(
        (sum, expense) => sum + Number(expense.amount),
        0
    );

    // Highest expense
    const highestExpense = expenses.reduce(
        (max, expense) =>
            Number(expense.amount) > Number(max.amount)
                ? expense
                : max
    );

    highestExpenseEl.textContent =
        formatCurrency(highestExpense.amount);

    highestExpenseTitleEl.textContent =
        highestExpense.title;


    // Lowest expense
    const lowestExpense = expenses.reduce(
        (min, expense) =>
            Number(expense.amount) < Number(min.amount)
                ? expense
                : min
    );

    lowestExpenseEl.textContent =
        formatCurrency(lowestExpense.amount);

    lowestExpenseTitleEl.textContent =
        lowestExpense.title;


    // Average daily spending
    const uniqueDays = new Set(
        expenses.map(expense => expense.date)
    ).size;

    const averageDaily =
        uniqueDays > 0
            ? totalSpent / uniqueDays
            : 0;

    averageDailyEl.textContent =
        formatCurrency(averageDaily);


    // Category totals
    const categoryTotals = {};

    expenses.forEach(expense => {

        const category =
            expense.category || "Other";

        categoryTotals[category] =
            (categoryTotals[category] || 0) +
            Number(expense.amount);
    });


    const sortedCategories =
        Object.entries(categoryTotals)
            .sort((a, b) => b[1] - a[1]);

    const topCategory =
        sortedCategories[0];

    if (topCategory) {

        topCategoryEl.textContent =
            topCategory[0];

        topCategoryAmountEl.textContent =
            formatCurrency(topCategory[1]);
    }


    // Insights
    const insights = [];

    insights.push(`
        🔥 Your highest expense is
        <strong>${formatCurrency(highestExpense.amount)}</strong>
        for <strong>${escapeHTML(highestExpense.title)}</strong>.
    `);

    if (topCategory) {

        insights.push(`
            🏷️ Your highest spending category is
            <strong>${escapeHTML(topCategory[0])}</strong>
            with spending of
            <strong>${formatCurrency(topCategory[1])}</strong>.
        `);
    }

    insights.push(`
        📊 Your average spending per recorded day is
        <strong>${formatCurrency(averageDaily)}</strong>.
    `);


    insightsListEl.innerHTML =
        insights.map(
            insight =>
                `<div class="insight-item">${insight}</div>`
        ).join("");
}
renderSmartAnalytics();
const exportPdfBtn =
    document.getElementById("exportPdfBtn");

if (exportPdfBtn) {

    exportPdfBtn.addEventListener(
        "click",
        function () {

            if (expenses.length === 0) {
                alert("No expenses available to export.");
                return;
            }

            const { jsPDF } = window.jspdf;

            const doc = new jsPDF();

            /* =========================
               BASIC DATA
            ========================= */

            const totalSpent =
                expenses.reduce(
                    (sum, expense) =>
                        sum + Number(expense.amount),
                    0
                );

            const average =
                totalSpent / expenses.length;


            /* =========================
               CATEGORY TOTALS
            ========================= */

            const categoryTotals = {};

            expenses.forEach(expense => {

                const category =
                    expense.category || "Other";

                categoryTotals[category] =
                    (categoryTotals[category] || 0) +
                    Number(expense.amount);
            });


            /* =========================
               MONTHLY TOTALS
            ========================= */

            const monthlyTotals = {};

            expenses.forEach(expense => {

                const month =
                    expense.date.substring(0, 7);

                monthlyTotals[month] =
                    (monthlyTotals[month] || 0) +
                    Number(expense.amount);
            });


            /* =========================
               HEADER
            ========================= */

            doc.setFontSize(24);

            doc.text(
                "SpendWise",
                20,
                22
            );

            doc.setFontSize(14);

            doc.text(
                "Student Expense Report",
                20,
                32
            );

            doc.setFontSize(9);

            doc.text(
                `Generated: ${getLocalDateString()}`,
                145,
                22
            );


            /* =========================
               SUMMARY
            ========================= */

            doc.setFontSize(14);

            doc.text(
                "Financial Summary",
                20,
                50
            );

            doc.setFontSize(11);

            doc.text(
                `Total Spending: ${formatCurrency(totalSpent)}`,
                25,
                62
            );

            doc.text(
                `Total Transactions: ${expenses.length}`,
                25,
                70
            );

            doc.text(
                `Average Transaction: ${formatCurrency(average)}`,
                25,
                78
            );


            /* =========================
               CATEGORY SUMMARY
            ========================= */

            doc.setFontSize(14);

            doc.text(
                "Category Breakdown",
                20,
                95
            );

            let y = 106;

            doc.setFontSize(10);

            Object.entries(categoryTotals)
                .sort((a, b) => b[1] - a[1])
                .forEach(([category, amount]) => {

                    doc.text(
                        `${category}: ${formatCurrency(amount)}`,
                        25,
                        y
                    );

                    y += 7;
                });


            /* =========================
               MONTHLY SUMMARY
            ========================= */

            y += 8;

            doc.setFontSize(14);

            doc.text(
                "Monthly Spending",
                20,
                y
            );

            y += 11;

            doc.setFontSize(10);

            Object.entries(monthlyTotals)
                .sort((a, b) => a[0].localeCompare(b[0]))
                .forEach(([month, amount]) => {

                    if (y > 270) {

                        doc.addPage();

                        y = 20;
                    }

                    doc.text(
                        `${formatMonth(month)}: ${formatCurrency(amount)}`,
                        25,
                        y
                    );

                    y += 7;
                });


            /* =========================
               EXPENSE DETAILS
            ========================= */

            doc.addPage();

            doc.setFontSize(16);

            doc.text(
                "Expense Details",
                20,
                20
            );

            y = 32;

            doc.setFontSize(9);

            expenses.forEach((expense, index) => {

                if (y > 275) {

                    doc.addPage();

                    y = 20;
                }

                const title =
                    String(expense.title)
                        .substring(0, 28);

                const category =
                    String(expense.category)
                        .substring(0, 18);

                doc.text(
                    `${index + 1}. ${expense.date}`,
                    20,
                    y
                );

                doc.text(
                    title,
                    55,
                    y
                );

                doc.text(
                    category,
                    115,
                    y
                );

                doc.text(
                    formatCurrency(expense.amount),
                    160,
                    y
                );

                y += 7;
            });


            /* =========================
               FOOTER
            ========================= */

            const pageCount =
                doc.internal.getNumberOfPages();

            for (
                let page = 1;
                page <= pageCount;
                page++
            ) {

                doc.setPage(page);

                doc.setFontSize(8);

                doc.text(
                    "SpendWise • Built by Sonam Kumari",
                    20,
                    290
                );

                doc.text(
                    `Page ${page} of ${pageCount}`,
                    170,
                    290
                );
            }


            /* =========================
               DOWNLOAD
            ========================= */

            doc.save(
                "SpendWise-Professional-Expense-Report.pdf"
            );
        }
    );
}
const pdfButton =
    document.getElementById("exportPdfBtn");

if (pdfButton) {

    pdfButton.onclick = function () {

        if (!window.jspdf) {
            alert("PDF library is not loaded. Please refresh the page.");
            return;
        }

        if (expenses.length === 0) {
            alert("No expenses available to export.");
            return;
        }

        const { jsPDF } = window.jspdf;

        const doc = new jsPDF();

        /* =========================
           PDF CURRENCY
        ========================= */

        function pdfCurrency(amount) {
            return "Rs. " +
                Number(amount).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
        }


        /* =========================
           DATA
        ========================= */

        const totalSpent =
            expenses.reduce(
                (sum, expense) =>
                    sum + Number(expense.amount),
                0
            );

        const average =
            totalSpent / expenses.length;


        /* =========================
           CATEGORY TOTALS
        ========================= */

        const categoryTotals = {};

        expenses.forEach(expense => {

            const category =
                expense.category || "Other";

            categoryTotals[category] =
                (categoryTotals[category] || 0) +
                Number(expense.amount);
        });


        /* =========================
           MONTHLY TOTALS
        ========================= */

        const monthlyTotals = {};

        expenses.forEach(expense => {

            const month =
                expense.date.substring(0, 7);

            monthlyTotals[month] =
                (monthlyTotals[month] || 0) +
                Number(expense.amount);
        });


        /* =========================
           HEADER
        ========================= */

        doc.setFontSize(24);
        doc.setFont("helvetica", "bold");

        doc.text(
            "SpendWise",
            20,
            22
        );

        doc.setFontSize(14);
        doc.setFont("helvetica", "normal");

        doc.text(
            "Student Expense Report",
            20,
            31
        );

        doc.setFontSize(9);

        doc.text(
            "Generated: " + getLocalDateString(),
            145,
            22
        );


        /* =========================
           SUMMARY BOX
        ========================= */

        doc.setFontSize(15);
        doc.setFont("helvetica", "bold");

        doc.text(
            "Financial Summary",
            20,
            50
        );

        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);

        doc.text(
            "Total Spending: " +
            pdfCurrency(totalSpent),
            25,
            62
        );

        doc.text(
            "Transactions: " +
            expenses.length,
            25,
            70
        );

        doc.text(
            "Average Transaction: " +
            pdfCurrency(average),
            25,
            78
        );


        /* =========================
           CATEGORY BREAKDOWN
        ========================= */

        doc.setFontSize(15);
        doc.setFont("helvetica", "bold");

        doc.text(
            "Category Breakdown",
            20,
            95
        );

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);

        let y = 106;

        Object.entries(categoryTotals)
            .sort((a, b) => b[1] - a[1])
            .forEach(([category, amount]) => {

                doc.text(
                    category,
                    25,
                    y
                );

                doc.text(
                    pdfCurrency(amount),
                    150,
                    y
                );

                y += 8;
            });


        /* =========================
           MONTHLY SUMMARY
        ========================= */

        y += 8;

        doc.setFontSize(15);
        doc.setFont("helvetica", "bold");

        doc.text(
            "Monthly Spending",
            20,
            y
        );

        y += 12;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);

        Object.entries(monthlyTotals)
            .sort((a, b) =>
                a[0].localeCompare(b[0])
            )
            .forEach(([month, amount]) => {

                if (y > 270) {

                    doc.addPage();

                    y = 20;
                }

                doc.text(
                    formatMonth(month),
                    25,
                    y
                );

                doc.text(
                    pdfCurrency(amount),
                    150,
                    y
                );

                y += 8;
            });


        /* =========================
           EXPENSE DETAILS
        ========================= */

        doc.addPage();

        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");

        doc.text(
            "Expense Details",
            20,
            20
        );


        /* Table Header */

        y = 34;

        doc.setFontSize(9);

        doc.text("Date", 20, y);
        doc.text("Title", 50, y);
        doc.text("Category", 115, y);
        doc.text("Amount", 160, y);

        y += 5;

        doc.line(
            20,
            y,
            190,
            y
        );

        y += 8;


        /* Table Rows */

        doc.setFont("helvetica", "normal");

        expenses.forEach(expense => {

            if (y > 275) {

                doc.addPage();

                y = 25;

                doc.setFont("helvetica", "bold");

                doc.text("Date", 20, y);
                doc.text("Title", 50, y);
                doc.text("Category", 115, y);
                doc.text("Amount", 160, y);

                y += 8;

                doc.setFont("helvetica", "normal");
            }


            const title =
                String(expense.title)
                    .substring(0, 30);

            const category =
                String(expense.category)
                    .substring(0, 18);


            doc.text(
                expense.date,
                20,
                y
            );

            doc.text(
                title,
                50,
                y
            );

            doc.text(
                category,
                115,
                y
            );

            doc.text(
                pdfCurrency(expense.amount),
                160,
                y
            );

            y += 8;
        });


        /* =========================
           FOOTER
        ========================= */

        const totalPages =
            doc.internal.getNumberOfPages();

        for (
            let page = 1;
            page <= totalPages;
            page++
        ) {

            doc.setPage(page);

            doc.setFontSize(8);

            doc.setFont(
                "helvetica",
                "normal"
            );

            doc.text(
                "SpendWise | Built by Sonam Kumari",
                20,
                290
            );

            doc.text(
                "Page " +
                page +
                " of " +
                totalPages,
                165,
                290
            );
        }


        /* =========================
           DOWNLOAD
        ========================= */

        doc.save(
            "SpendWise-Student-Expense-Report.pdf"
        );
    };
}
console.log("NEW PDF CODE LOADED");
const reminderTitleInput = document.getElementById("reminderTitle");
const reminderDateInput = document.getElementById("reminderDate");
const reminderTimeInput = document.getElementById("reminderTime");
const setReminderBtn = document.getElementById("setReminderBtn");
const reminderMessage = document.getElementById("reminderMessage");

let reminderTimer = null;
let savedReminder = JSON.parse(localStorage.getItem("spendwiseReminder")) || null;

async function requestNotificationPermission() {

    if (!("Notification" in window)) {
        return false;
    }

    if (Notification.permission === "granted") {
        return true;
    }

    const permission = await Notification.requestPermission();

    return permission === "granted";
}

setReminderBtn.addEventListener("click", async function () {

    const title = reminderTitleInput.value.trim();
    const date = reminderDateInput.value;
    const time = reminderTimeInput.value;

    if (!title || !date || !time) {
        reminderMessage.textContent =
            "Please enter reminder, date and time.";
        return;
    }

    const reminderDateTime = new Date(`${date}T${time}`);

    if (reminderDateTime <= new Date()) {
        reminderMessage.textContent =
            "Please select a future date and time.";
        return;
    }

    if (reminderTimer) {
        clearTimeout(reminderTimer);
    }

const newReminder = {
    title: title,
    date: date,
    time: time
};

reminders.push(newReminder);

localStorage.setItem(
    "spendwiseReminders",
    JSON.stringify(reminders)
);

renderReminders();

    const delay = reminderDateTime.getTime() - Date.now();

    reminderTimer = setTimeout(function () {

      if ("Notification" in window && Notification.permission === "granted") {
    new Notification("SpendWise Reminder", {
        body: title
    });
} else {
    alert(`⏰ Reminder: ${title}`);
}

        reminderMessage.textContent =
            `Reminder completed: ${title}`;

    }, delay);

    reminderMessage.textContent =
        `✅ Reminder set for ${date} at ${time}`;

    reminderTitleInput.value = "";
    reminderDateInput.value = "";
    reminderTimeInput.value = "";

    
});

function renderReminders() {

    if (!reminderList) return;

    reminderList.innerHTML = "";

    if (reminders.length === 0) {
        reminderList.innerHTML =
            `<div class="empty-state">No reminders set yet.</div>`;
        return;
    }

    reminders.forEach(function (reminder, index) {

        const item = document.createElement("div");
        item.className = "reminder-item";

        item.innerHTML = `
            <div>
                <strong>⏰ ${escapeHTML(reminder.title)}</strong>
                <small>
                    ${reminder.date} at ${reminder.time}
                </small>
            </div>

            <button
                type="button"
                class="delete-btn"
                onclick="deleteReminder(${index})"
            >
                🗑️ Delete
            </button>
        `;

        reminderList.appendChild(item);
    });
}

function deleteReminder(index) {

    reminders.splice(index, 1);

    localStorage.setItem(
        "spendwiseReminders",
        JSON.stringify(reminders)
    );

    renderReminders();
}

renderReminders();
function removePastReminders() {

    const now = new Date();

    reminders = reminders.filter(function (reminder) {

        const reminderDateTime =
            new Date(`${reminder.date}T${reminder.time}`);

        return reminderDateTime > now;
    });

    localStorage.setItem(
        "spendwiseReminders",
        JSON.stringify(reminders)
    );

    renderReminders();
}

removePastReminders();
function scheduleReminders() {

    reminders.forEach(function (reminder) {

        const reminderDateTime =
            new Date(`${reminder.date}T${reminder.time}`);

        const delay =
            reminderDateTime.getTime() - Date.now();

        if (delay <= 0) {
            return;
        }

        setTimeout(function () {

            if (
                "Notification" in window &&
                Notification.permission === "granted"
            ) {
                new Notification("SpendWise Reminder", {
                    body: reminder.title
                });
            } else {
                alert(`⏰ Reminder: ${reminder.title}`);
            }

        }, delay);
    });
}

scheduleReminders();