const loginContainer = document.querySelector("#login-container")
const myBudgetContainer = document.querySelector("#myBudget-container")
const usernameInputField = document.getElementById("username")
const usernameSubmitBtn = document.querySelector(".btn-success")
const loginError = document.querySelector(".invalid-feedback")
const logoutBtn = document.querySelector("#logout-button")
const newBudgetContainer = document.querySelector("#end-budget-container");
const subcategoryDropdown = document.getElementById("subcategory-dropdown");
const subcategoriesContainer = document.getElementById("subcategories-container")
const incomeInputDescription = document.getElementById("income-description");
const incomeInputAmount = document.getElementById("income-amount");
const incomeSubmitBtn = document.querySelector("#income-submit-button");
const incomeSbmtError = document.querySelector("#invalid-income")
const incomeListContainer = document.getElementById("income-list");
const incomeTotalContainer = document.getElementById("income-total");
const expenseInputDescription = document.getElementById("expense-description");
const expenseInputAmount = document.getElementById("expense-amount");
const expenseSubmitBtn = document.querySelector("#expense-submit-button");
const expenseSbmtError = document.querySelector("#invalid-expense")
const expenseListContainer = document.getElementById("expense-list");
const expenseTotalContainer = document.getElementById("expense-total")
let expenseChart = document.getElementById("expense-chart").getContext("2d");
let currentUser;
let currentUserId;
let budgets;
let incomeList;
let incomeTotal = 0;
let expenseList;
let expenseTotal = 0;
let newBudget = 0;
let subcategories = [];
let subcategoriesData = [];
let uniqExpenseNames;
let expenseSums;


// income form submit
incomeSubmitBtn.addEventListener('click', function(e) {
    e.preventDefault();
    if(incomeInputDescription.value === "" || incomeInputAmount.value === "" || incomeInputAmount.value < 0) {
        incomeSbmtError.style.display = 'block';
        
        setTimeout(() => {incomeSbmtError.style.display = 'none'}, 4000);
    } else {
        let formData = {
            amount: incomeInputAmount.value,
            category: 0,
            description: incomeInputDescription.value,
            user_id: currentUserId
        }
        incomeInputDescription.value = ""
        incomeInputAmount.value = ""
        
        postBudget(formData);
    }    
})

// expense form submit
expenseSubmitBtn.addEventListener('click', function(e) {
    e.preventDefault();
    let formData = {
        amount: expenseInputAmount.value,
        category: 1,
        description: expenseInputDescription.value,
        subcategory_id: subcategoryDropdown.value,
        user_id: currentUserId
    }

    expenseInputDescription.value = ""
    expenseInputAmount.value = ""

    postBudget(formData);
    
})

// post new budget
function postBudget(budgetData) {
    let configObj = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(budgetData)
    }

    fetch('http://localhost:3000/budgets', configObj)
        .then(res => res.json())

    clearAllData()
    getUserBudgetData(currentUserId)
}

function clearIncomeTotals() {
    incomeTotalContainer.innerHTML = ""
    incomeListContainer.innerHTML = ""
    incomeTotal = 0
}

function clearBudgetTotals() {
    newBudgetContainer.innerHTML = ""
    newBudget = 0
}

function clearExpenseTotals() {
    expenseTotalContainer.innerHTML = ""
    expenseListContainer.innerHTML = ""
    expenseTotal = 0
}

function clearAllData() {
    clearIncomeTotals()
    clearExpenseTotals()
    clearBudgetTotals()
}

// 3464.3563 -> 3,464.36  // 7000 -> 7,000.00
function formatTotal(total) {
    let totalSplit, int, dec;

    total = Math.abs(total);
    total = total.toFixed(2);

    totalSplit = total.split('.');

    int = totalSplit[0];
    if(int.length > 3) {
        int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
    }

    dec = totalSplit[1];

    return int + '.' + dec;
}

// display income info
function renderIncome(objArray) {
    objArray.forEach(obj => {
        incomeListContainer.innerHTML += `
            <p>+ ${obj.attributes.description} $${formatTotal(obj.attributes.amount)}</p>
        `
        incomeTotal += obj.attributes.amount
        newBudget = formatTotal(incomeTotal)
        
    })

    newBudgetContainer.innerHTML = `
        <h4>Remaining Budget: $${newBudget}</h4>
    `
    incomeTotalContainer.innerHTML = `
        <h4>Income Total: $${formatTotal(incomeTotal)}</h4>
    `
}

// display expense info
function renderExpense(objArray) {
    objArray.forEach(obj => {
        expenseListContainer.innerHTML += `
            <p>- ${obj.attributes.description} $${formatTotal(obj.attributes.amount)}</p>
        `
        expenseTotal += obj.attributes.amount
        // console.log(expenseTotal)
        newBudget = formatTotal(incomeTotal - expenseTotal)
        // console.log(newBudget)
    })
    newBudgetContainer.innerHTML = `
        <h4>Remaining Budget: $${newBudget}</h4>
    `
    expenseTotalContainer.innerHTML = `
        <h4>Expense Total: $${formatTotal(expenseTotal)}</h4>
    `
}


// get subcategories and add to dropdown options
fetch("http://localhost:3000/subcategories")
    .then(res => res.json())
    .then(json => {
        json.data.forEach(function(obj) {
            subcategoryDropdown.innerHTML += `
            <option value="${obj.id}">${obj.attributes.name}</option>
            `
        })
    })


// login form submit
usernameSubmitBtn.addEventListener('click', function(e) {
    e.preventDefault();
    if(usernameInputField.value === "") {
        loginError.style.display = 'block'
        setTimeout(() => {loginError.style.display = 'none'}, 4000)
    } else {
        let userData = {
            username: usernameInputField.value
        }
        loginUser(userData);
        loginContainer.style.display = 'none'
        myBudgetContainer.style.display = 'block'
    }
})

// get current user info
function loginUser(userData) {
    let configObj = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(userData)
    }

    fetch('http://localhost:3000/users', configObj)
        .then(res => res.json())
        .then(json => {
            currentUserId = json.data.id;
            console.log(currentUserId)


            getUserBudgetData(currentUserId)
        });
}

// render budget info
function getUserBudgetData(userId) {
    fetch(`http://localhost:3000/users/` + userId)
        .then(res => res.json())
        .then(json => {
            console.log(json)
            budgets = json.included;

            incomeList = budgets.filter(budget => {
                return budget.attributes.category === "income"
            });
            expenseList = budgets.filter(budget => {
                return budget.attributes.category === "expense"
            });
            console.log(incomeList)

                
            // create obj for chart labels and data
            const subcategoryObj = {};

            expenseList.forEach(expense => {
                if(!subcategoryObj[expense.attributes.subcategory.name]){
                    subcategoryObj[expense.attributes.subcategory.name] = 0;
                }
                subcategoryObj[expense.attributes.subcategory.name]+= expense.attributes.amount;

            })

            renderIncome(incomeList);
            renderExpense(expenseList);
        });
}

logoutBtn.addEventListener('click', function(e) {
    e.preventDefault()
    location.reload()
})

