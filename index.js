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
const incomeListTable = document.getElementById("income-list");
const incomeTotalContainer = document.getElementById("income-total");
const expenseInputDescription = document.getElementById("expense-description");
const expenseInputAmount = document.getElementById("expense-amount");
const expenseSubmitBtn = document.querySelector("#expense-submit-button");
const expenseSbmtError = document.querySelector("#invalid-expense")
const expenseListTable = document.getElementById("expense-list");
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
let budgetHolder;
let budgetType;


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

// render user budget info
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
    if(expenseInputDescription.value === "" || expenseInputAmount.value === "" || expenseInputAmount.value < 0) {
        expenseSbmtError.style.display = 'block';
        
        setTimeout(() => {expenseSbmtError.style.display = 'none'}, 4000);
    } else {

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
    }
    
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
    incomeListTable.innerHTML = ""
    incomeTotal = 0
}

function clearBudgetTotals() {
    newBudgetContainer.innerHTML = ""
    newBudget = 0
}

function clearExpenseTotals() {
    expenseTotalContainer.innerHTML = ""
    expenseListTable.innerHTML = ""
    expenseTotal = 0
}

function clearAllData() {
    clearIncomeTotals()
    clearExpenseTotals()
    clearBudgetTotals()
}

// 3464.3563 -> 3,464.36  // 7000 -> 7,000.00
function formatTotal(total, type) {
    let totalSplit, int, dec;

    total = Math.abs(total);
    total = total.toFixed(2);

    totalSplit = total.split('.');

    int = totalSplit[0];
    if(int.length > 3) {
        int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
    }

    dec = totalSplit[1];

    return (type === 'exp' ? '-' : '+') + ' ' + '$' + int + '.' + dec;
}

function calcBudget(total, type) {
    if(total > 0) {
        type = 'inc'
        newBudgetContainer.style.color = '#212529'
    } else {
        type = 'exp'
        newBudgetContainer.style.color = 'red'
    }
    // total > 0 ? type = 'inc' : type = 'exp'
    newBudget = formatTotal(total, type)
}

// display income info
function renderIncome(objArray) {
    objArray.forEach(incObj => {
        let incDesc = incObj.attributes.description
        let incAmt = incObj.attributes.amount
        incId = incObj.id

        incomeListTable.innerHTML += `
            <tr>
                <td>${incDesc.toUpperCase()}</td>
                <td>${formatTotal(incAmt, 'inc')}</td>
                <td><div class="delete-item" id="inc-${incId}"><i class="icon ion-md-close-circle-outline"></i></div></td>
            </tr>
        `
        // incDeleteBtn = document.querySelector(`#inc-${incId}`);

        incomeTotal += incObj.attributes.amount
        budgetHolder = incomeTotal
        calcBudget(budgetHolder, budgetType)
    })

    newBudgetContainer.innerHTML = `
        <h4>Remaining Budget: ${newBudget}</h4>
    `
    incomeTotalContainer.innerHTML = `
        <h4>Income Total: ${formatTotal(incomeTotal, 'inc')}</h4>
    `
    
}

// display expense info
function renderExpense(objArray) {
    objArray.forEach(expObj => {
        let expDesc = expObj.attributes.description
        let expAmt = expObj.attributes.amount
        expId = expObj.id

        expenseListTable.innerHTML += `
            <tr>
                <td>${expDesc.toUpperCase()}</td>
                <td>${formatTotal(expAmt, 'exp')}</td>
                <td><i class="icon ion-md-close-circle-outline"></i></td>
            </tr>
        `       
        expenseTotal += expObj.attributes.amount
        // console.log(expenseTotal)
        budgetHolder = incomeTotal - expenseTotal
        calcBudget(budgetHolder, budgetType)
    })
    newBudgetContainer.innerHTML = `
        <h4>Remaining Budget: ${newBudget}</h4>
    `
    expenseTotalContainer.innerHTML = `
        <h4>Expense Total: ${formatTotal(expenseTotal, 'exp')}</h4>
    `
}

// delete items from income list
incomeListTable.addEventListener("click", function(e) {
    e.preventDefault()
    let incomeId = e.target.parentNode.id.split('-')[1]
    console.log(incomeId)
    if(e.target.className === "icon ion-md-close-circle-outline") {
        // console.log(this)
        let configObj = {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({id: incomeId})
        }
        fetch('http://localhost:3000/budgets/' + incomeId, configObj)
            .then(res => res.json())
            .then(json => {
                clearAllData()
                getUserBudgetData(currentUserId)
            })
    }
})

// delete items from expense list

// logout
logoutBtn.addEventListener('click', function(e) {
    e.preventDefault()
    location.reload()
})

