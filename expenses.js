let selectedExpenseType = "";
let selectedSubCategory = "";

let editingExpenseIndex = -1;

let selectedEditExpenseType = "";
let selectedEditSubCategory = "";

let currentPeriod = "This Month";


const subCategoryData = {

    Food: [
        "Company",
        "Home",
        "My"
    ],

    Fuel: [
        "Bike",
        "Wheel",
        "Cab"
    ],

    Bills: [
        "Bike",
        "Cab",
        "Wheel",
        "Home",
        "Others"
    ],

    Shopping: [
        "GF",
        "My",
        "Family"
    ],

    Vita: []

};


const categoryImages = {

    Food: "food.png",

    Fuel: "fuel.png",

    Bills: "bill.png",

    Shopping: "shopping.png",

    Vita: "vita.png"

};


window.onload = function () {

    setTodayDate("expenseDate");

    setFilterToday();

    loadExpenses();

    updateCurrentExpenses();

    loadExpenseChart();

    setupPeriodClick();

};


function setTodayDate(id) {

    const today = new Date();

    const day =
        String(today.getDate())
        .padStart(2, "0");

    const month =
        String(today.getMonth() + 1)
        .padStart(2, "0");

    const year =
        today.getFullYear();

    const input =
        document.getElementById(id);

    if (input) {

        input.value =
            `${day}/${month}/${year}`;

    }

}


function openExpenseForm() {

    document
        .getElementById("expenseForm")
        .classList
        .add("show");

}


function closeExpenseForm() {

    document
        .getElementById("expenseForm")
        .classList
        .remove("show");

    clearExpenseForm();

}


function selectExpenseType(element, type) {

    selectedExpenseType = type;

    selectedSubCategory = "";

    document
        .getElementById("selectedExpenseType")
        .value = type;

    document
        .getElementById("selectedSubCategory")
        .value = "";

    document
        .querySelectorAll(
            "#expenseForm .expense-category"
        )
        .forEach(card => {

            card.classList
                .remove("active");

        });

    element
        .classList
        .add("active");

    showSubCategories(type);
    const amountInput =
    document.getElementById(
        "expenseAmount"
    );

if (type === "Vita") {

    amountInput.value = "100";

}

}


function showSubCategories(type) {

    const section =
        document
            .getElementById(
                "subCategorySection"
            );

    const container =
        document
            .getElementById(
                "subCategories"
            );

    const list =
        subCategoryData[type] || [];

    container.innerHTML = "";

    if (!list.length) {

        section
            .classList
            .remove("show");

        return;

    }

    section
        .classList
        .add("show");

    list.forEach(name => {

        const div =
            document
                .createElement("div");

        div.className =
            "sub-category";

        div.innerText =
            name;

        div.onclick =
            function () {

                selectedSubCategory =
                    name;

                document
                    .getElementById(
                        "selectedSubCategory"
                    )
                    .value = name;

                container
                    .querySelectorAll(
                        ".sub-category"
                    )
                    .forEach(item => {

                        item.classList
                            .remove("active");

                    });

                div
                    .classList
                    .add("active");

            };

        container
            .appendChild(div);

    });

}


function saveExpense() {

    const amount =
        Number(
            document
                .getElementById(
                    "expenseAmount"
                )
                .value
        );

    const date =
        document
            .getElementById(
                "expenseDate"
            )
            .value;

    const description =
        document
            .getElementById(
                "expenseDescription"
            )
            .value
            .trim();


    if (!amount || amount <= 0) {

        alert(
            "Please enter a valid amount"
        );

        return;

    }


    if (!selectedExpenseType) {

        alert(
            "Please select expense type"
        );

        return;

    }


    if (
        subCategoryData[
            selectedExpenseType
        ].length &&
        !selectedSubCategory
    ) {

        alert(
            "Please select sub category"
        );

        return;

    }


    const expense = {

        type:
            selectedExpenseType,

        subCategory:
            selectedSubCategory,

        amount:
            amount,

        date:
            date,

        description:
            description,

        image:
            categoryImages[
                selectedExpenseType
            ]

    };


    const expenses =
        JSON.parse(
            localStorage
                .getItem(
                    "expenseList"
                )
        ) || [];


    expenses
        .push(expense);


    localStorage
        .setItem(
            "expenseList",

            JSON.stringify(
                expenses
            )
        );


    loadExpenses();

    updateCurrentExpenses();

    loadExpenseChart();

    closeExpenseForm();

    alert(
        "Expense saved successfully"
    );

}


function loadExpenses() {

    const expenses =
        JSON.parse(
            localStorage
                .getItem(
                    "expenseList"
                )
        ) || [];


    const list =
        document
            .getElementById(
                "expenseHistoryList"
            );


    if (!list) return;


    list.innerHTML = "";


    if (!expenses.length) {

        list.innerHTML =
            "<p>No expense records yet.</p>";

        return;

    }


    expenses
    .slice()

    .filter(expense => {

        if (
            filterCategory &&
            expense.type !== filterCategory
        ) {
            return false;
        }

        if (
            filterSubCategory &&
            expense.subCategory !== filterSubCategory
        ) {
            return false;
        }

        if (filterSearch) {

            const searchText = (
                (expense.description || "") +
                " " +
                expense.type +
                " " +
                (expense.subCategory || "")
            ).toLowerCase();

            if (
                !searchText.includes(filterSearch)
            ) {
                return false;
            }

        }

        if (
            filterFromDate ||
            filterToDate
        ) {

            const p =
                expense.date.split("/");

            const expenseDate =
                new Date(
                    p[2],
                    p[1] - 1,
                    p[0]
                );

            if (filterFromDate) {

                const from =
                    new Date(filterFromDate);

                if (
                    expenseDate < from
                ) {
                    return false;
                }

            }

            if (filterToDate) {

                const to =
                    new Date(filterToDate);

                to.setHours(
                    23,
                    59,
                    59,
                    999
                );

                if (
                    expenseDate > to
                ) {
                    return false;
                }

            }

        }

        return true;

    })

    .reverse()

    .forEach(
            function (
                expense,
                index
            ) {


                const realIndex =
                    expenses.length -
                    1 -
                    index;


                const item =
                    document
                        .createElement(
                            "div"
                        );


                item.className =
                    "expense-history-item";


                item.innerHTML = `

                    <div
                        class="expense-history-main"
                        onclick="toggleExpenseActions(this)"
                    >

                        <div
                            class="expense-history-icon"
                        >

                            <img
                                src="${
                                    expense.image ||
                                    categoryImages[
                                        expense.type
                                    ]
                                }"
                            >

                        </div>


                        <div
                            class="expense-history-details"
                        >

                            <h4>
                                ${
                                    expense.type
                                }

                                ${
                                    expense.subCategory
                                    ? " - " +
                                      expense.subCategory
                                    : ""
                                }
                            </h4>


                            <p>
                                Date:
                                ${
                                    expense.date
                                }
                            </p>


                            <p>
                                ${
                                    expense.description ||
                                    "No description"
                                }
                            </p>

                        </div>


                        <div
                            class="expense-history-amount"
                        >

                            - Rs.

                            ${
                                Number(
                                    expense.amount
                                )
                                .toLocaleString(
                                    "en-US",
                                    {
                                        minimumFractionDigits: 2
                                    }
                                )
                            }

                        </div>

                    </div>


                    <div
                        class="expense-actions"
                    >

                        <button
                            class="edit-btn"
                            onclick="
                                editExpense(
                                    ${realIndex}
                                );

                                event.stopPropagation();
                            "
                        >

                            <img
                                src="Edite.png"
                            >

                        </button>


                        <button
                            class="delete-btn"
                            onclick="
                                showDeleteExpense(
                                    ${realIndex}
                                );

                                event.stopPropagation();
                            "
                        >

                            <img
                                src="Delete.png"
                            >

                        </button>

                    </div>

                `;


                list
                    .appendChild(
                        item
                    );

            }
        );

}


function toggleExpenseActions(element) {

    const currentItem =
        element
            .closest(
                ".expense-history-item"
            );


    document
        .querySelectorAll(
            ".expense-history-item"
        )
        .forEach(item => {

            if (
                item !== currentItem
            ) {

                item
                    .classList
                    .remove(
                        "active"
                    );

            }

        });


    currentItem
        .classList
        .toggle(
            "active"
        );

}


function updateCurrentExpenses() {

    const expenses =
        JSON.parse(
            localStorage
                .getItem(
                    "expenseList"
                )
        ) || [];


    const total =
        expenses

            .filter(
                expense =>
                    isInSelectedPeriod(
                        expense.date
                    )
            )

            .reduce(
                (
                    sum,
                    expense
                ) => {

                    return sum +
                        Number(
                            expense.amount
                        );

                },

                0

            );


    document
        .getElementById(
            "currentExpenses"
        )
        .innerText =

        "Rs. " +

        total
            .toLocaleString(
                "en-US",
                {
                    minimumFractionDigits: 2,

                    maximumFractionDigits: 2
                }
            );

}


function togglePeriodMenu() {

    const menu =
        document
            .getElementById(
                "periodMenu"
            );


    menu.style.display =

        menu.style.display ===
        "block"

            ? "none"

            : "block";

}


function selectPeriod(period) {

    currentPeriod =
        period;


    document
        .getElementById(
            "selectedPeriod"
        )
        .innerText =
        period;


    document
        .getElementById(
            "periodMenu"
        )
        .style.display =
        "none";


    updateCurrentExpenses();

    loadExpenseChart();

}


function setupPeriodClick() {

    document
        .addEventListener(
            "click",
            function (e) {

                const menu =
                    document
                        .getElementById(
                            "periodMenu"
                        );

                const button =
                    document
                        .querySelector(
                            ".period-btn"
                        );


                if (

                    menu &&

                    button &&

                    !button
                        .contains(
                            e.target
                        ) &&

                    !menu
                        .contains(
                            e.target
                        )

                ) {

                    menu
                        .style
                        .display =
                        "none";

                }

            }
        );

}


function isInSelectedPeriod(
    dateString
) {

    const parts =
        dateString
            .split(
                "/"
            );


    const date =
        new Date(
            parts[2],

            parts[1] - 1,

            parts[0]
        );


    const today =
        new Date();


    today
        .setHours(
            0,
            0,
            0,
            0
        );


    date
        .setHours(
            0,
            0,
            0,
            0
        );


    if (
        currentPeriod ===
        "Today"
    ) {

        return date
            .getTime() ===
            today
                .getTime();

    }


    if (
        currentPeriod ===
        "This Week"
    ) {

        const firstDay =
            new Date(
                today
            );


        const day =
            today
                .getDay();


        firstDay
            .setDate(
                today
                    .getDate() -

                (
                    day === 0
                        ? 6
                        : day - 1
                )
            );


        firstDay
            .setHours(
                0,
                0,
                0,
                0
            );


        return (

            date >=
            firstDay &&

            date <=
            today

        );

    }


    if (
        currentPeriod ===
        "This Month"
    ) {

        return (

            date
                .getMonth() ===

            today
                .getMonth() &&

            date
                .getFullYear() ===

            today
                .getFullYear()

        );

    }


    if (
        currentPeriod ===
        "This Year"
    ) {

        return (

            date
                .getFullYear() ===

            today
                .getFullYear()

        );

    }


    return true;

}


/* =========================
   EXPENSE BAR CHART
========================= */


function loadExpenseChart(){

    const expenses =
    JSON.parse(
    localStorage.getItem("expenseList")
    ) || [];

    const chart =
    document.getElementById(
    "expenseCategoryChart"
    );

    if(!chart) return;

    chart.innerHTML="";

    const totals={

        Food:0,

        Fuel:0,

        Bills:0,

        Shopping:0,

        Vita:0

    };

    expenses

    .filter(expense=>isInSelectedPeriod(expense.date))

    .forEach(expense=>{

        totals[expense.type]+=Number(expense.amount);

    });

    const totalExpense=
    Object.values(totals)
    .reduce((a,b)=>a+b,0);

    Object.keys(totals)
    .forEach(type=>{

        const amount=
        totals[type];

        const percent=

        totalExpense===0

        ?0

        :(amount/totalExpense)*100;

       chart.innerHTML+=`

<div class="chart-row">

    <div class="chart-icon">

        <img src="${categoryImages[type]}">

    </div>


    <div class="chart-content">


        <div class="chart-top">

            <span class="chart-name">
                ${type}
            </span>


            <span class="chart-amount">

                Rs. ${amount.toLocaleString("en-US",{
                    minimumFractionDigits:2,
                    maximumFractionDigits:2
                })}

            </span>

        </div>


        <div class="chart-bar">

            <div
            class="chart-fill"
            style="width:${percent}%">

            </div>

        </div>


        <div class="chart-percent">

            ${percent.toFixed(1)}%

        </div>


    </div>

</div>

`;

    });

}


/* =========================
   EDIT EXPENSE
========================= */


function editExpense(index) {

    const expenses =
        JSON.parse(
            localStorage
                .getItem(
                    "expenseList"
                )
        ) || [];


    const expense =
        expenses[
            index
        ];


    if (!expense) return;


    editingExpenseIndex =
        index;


    selectedEditExpenseType =
        expense.type;


    selectedEditSubCategory =
        expense.subCategory ||
        "";


    document
        .getElementById(
            "editExpenseAmount"
        )
        .value =
        expense.amount;


    document
        .getElementById(
            "editExpenseDate"
        )
        .value =
        expense.date;


    document
        .getElementById(
            "editExpenseDescription"
        )
        .value =

        expense.description ||
        "";


    createEditCategories();


    showEditSubCategories(
        expense.type
    );


    document
        .getElementById(
            "editExpensePopup"
        )
        .classList
        .add(
            "show"
        );

}


function createEditCategories() {

    const container =
        document
            .getElementById(
                "editExpenseCategories"
            );


    container.innerHTML =
        "";


    Object
        .keys(
            categoryImages
        )
        .forEach(
            type => {


                const div =
                    document
                        .createElement(
                            "div"
                        );


                div.className =
                    "expense-category";


                if (
                    type ===
                    selectedEditExpenseType
                ) {

                    div
                        .classList
                        .add(
                            "active"
                        );

                }


                div.innerHTML = `

                    <img
                        src="${
                            categoryImages[
                                type
                            ]
                        }"
                    >

                    <p>
                        ${
                            type
                        }
                    </p>

                `;


                div.onclick =
                    function () {


                        selectedEditExpenseType =
                            type;


                        selectedEditSubCategory =
                            "";


                        container
                            .querySelectorAll(
                                ".expense-category"
                            )
                            .forEach(
                                card => {

                                    card
                                        .classList
                                        .remove(
                                            "active"
                                        );

                                }
                            );


                        div
                            .classList
                            .add(
                                "active"
                            );


                        showEditSubCategories(
                            type
                        );

                    };


                container
                    .appendChild(
                        div
                    );

            }
        );

}


function showEditSubCategories(
    type
) {

    const container =
        document
            .getElementById(
                "editSubCategories"
            );


    container.innerHTML =
        "";


    const list =
        subCategoryData[
            type
        ] || [];


    list
        .forEach(
            name => {


                const div =
                    document
                        .createElement(
                            "div"
                        );


                div.className =
                    "sub-category";


                if (
                    name ===
                    selectedEditSubCategory
                ) {

                    div
                        .classList
                        .add(
                            "active"
                        );

                }


                div.innerText =
                    name;


                div.onclick =
                    function () {


                        selectedEditSubCategory =
                            name;


                        container
                            .querySelectorAll(
                                ".sub-category"
                            )
                            .forEach(
                                item => {

                                    item
                                        .classList
                                        .remove(
                                            "active"
                                        );

                                }
                            );


                        div
                            .classList
                            .add(
                                "active"
                            );

                    };


                container
                    .appendChild(
                        div
                    );

            }
        );

}


function closeEditExpense() {

    document
        .getElementById(
            "editExpensePopup"
        )
        .classList
        .remove(
            "show"
        );


    editingExpenseIndex =
        -1;

}


function updateExpense() {

    if (
        editingExpenseIndex ===
        -1
    ) return;


    const amount =
        Number(
            document
                .getElementById(
                    "editExpenseAmount"
                )
                .value
        );


    const date =
        document
            .getElementById(
                "editExpenseDate"
            )
            .value;


    const description =
        document
            .getElementById(
                "editExpenseDescription"
            )
            .value
            .trim();


    if (
        !amount ||
        amount <= 0
    ) {

        alert(
            "Please enter a valid amount"
        );

        return;

    }


    if (
        !selectedEditExpenseType
    ) {

        alert(
            "Please select expense type"
        );

        return;

    }


    if (

        subCategoryData[
            selectedEditExpenseType
        ].length &&

        !selectedEditSubCategory

    ) {

        alert(
            "Please select sub category"
        );

        return;

    }


    const expenses =
        JSON.parse(
            localStorage
                .getItem(
                    "expenseList"
                )
        ) || [];


    expenses[
        editingExpenseIndex
    ] = {

        type:
            selectedEditExpenseType,

        subCategory:
            selectedEditSubCategory,

        amount:
            amount,

        date:
            date,

        description:
            description,

        image:
            categoryImages[
                selectedEditExpenseType
            ]

    };


    localStorage
        .setItem(
            "expenseList",

            JSON.stringify(
                expenses
            )
        );


    loadExpenses();

    updateCurrentExpenses();

    loadExpenseChart();

    closeEditExpense();


    alert(
        "Expense updated successfully"
    );

}


function showDeleteExpense(index) {

    const popup =
        document
            .getElementById(
                "deleteExpensePopup"
            );


    popup
        .dataset
        .index =
        index;


    popup
        .classList
        .add(
            "show"
        );

}


function closeDeleteExpense() {

    document
        .getElementById(
            "deleteExpensePopup"
        )
        .classList
        .remove(
            "show"
        );

}


function confirmDeleteExpense() {

    const popup =
        document
            .getElementById(
                "deleteExpensePopup"
            );


    const index =
        Number(
            popup
                .dataset
                .index
        );


    const expenses =
        JSON.parse(
            localStorage
                .getItem(
                    "expenseList"
                )
        ) || [];


    if (
        !expenses[
            index
        ]
    ) return;


    expenses
        .splice(
            index,
            1
        );


    localStorage
        .setItem(
            "expenseList",

            JSON.stringify(
                expenses
            )
        );


    loadExpenses();

    updateCurrentExpenses();

    loadExpenseChart();

    closeDeleteExpense();

}


function clearExpenseForm() {

    selectedExpenseType =
        "";

    selectedSubCategory =
        "";


    document
        .getElementById(
            "expenseAmount"
        )
        .value =
        "";


    document
        .getElementById(
            "expenseDescription"
        )
        .value =
        "";


    document
        .getElementById(
            "selectedExpenseType"
        )
        .value =
        "";


    document
        .getElementById(
            "selectedSubCategory"
        )
        .value =
        "";


    document
        .querySelectorAll(
            "#expenseForm .expense-category"
        )
        .forEach(
            card => {

                card
                    .classList
                    .remove(
                        "active"
                    );

            }
        );


    document
        .getElementById(
            "subCategorySection"
        )
        .classList
        .remove(
            "show"
        );


    document
        .getElementById(
            "subCategories"
        )
        .innerHTML =
        "";

}
/* ===========================
        FILTER POPUP
=========================== */

let filterCategory = "";
let filterSubCategory = "";
let filterFromDate = "";
let filterToDate = "";
let filterSearch = "";

function openFilterPopup() {

    document
        .getElementById("filterPopup")
        .classList
        .add("show");

}

function closeFilterPopup() {

    document
        .getElementById("filterPopup")
        .classList
        .remove("show");

}
document
.getElementById("filterCategory")
.addEventListener("change",function(){

    const value=this.value;

    const sub=document.getElementById(
        "filterSubCategory"
    );

    sub.innerHTML=
    `<option value="">All</option>`;

    if(!value){

        return;

    }

    subCategoryData[value]
    .forEach(item=>{

        sub.innerHTML+=`
        <option>
            ${item}
        </option>
        `;

    });

});
function applyFilter(){

    filterCategory =
    document
    .getElementById(
        "filterCategory"
    ).value;

    filterSubCategory =
    document
    .getElementById(
        "filterSubCategory"
    ).value;

    filterFromDate =
   setFilterToday();

    filterSearch =
    document
    .getElementById(
        "filterSearch"
    )
    .value
    .trim()
    .toLowerCase();

    closeFilterPopup();

    loadExpenses();

    updateCurrentExpenses();

    loadExpenseChart();

}
function clearFilter(){

    filterCategory="";
    filterSubCategory="";
    filterFromDate="";
    filterToDate="";
    filterSearch="";

    document
    .getElementById(
        "filterCategory"
    ).value="";

    document
    .getElementById(
        "filterSubCategory"
    ).innerHTML=
    `<option value="">All</option>`;

    document
    .getElementById(
        "filterFromDate"
    ).value="";

    document
    .getElementById(
        "filterToDate"
    ).value="";

    document
    .getElementById(
        "filterSearch"
    ).value="";

    closeFilterPopup();

    loadExpenses();

    updateCurrentExpenses();

    loadExpenseChart();

}
function setFilterToday() {

    const today = new Date();

    const year = today.getFullYear();

    const month = String(
        today.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        today.getDate()
    ).padStart(2, "0");

    const value =
        `${year}-${month}-${day}`;

    const from =
        document.getElementById(
            "filterFromDate"
        );

    const to =
        document.getElementById(
            "filterToDate"
        );

    if (from) {

        from.value = value;

    }

    if (to) {

        to.value = value;

    }

}
