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
const incomeListContainer = document.getElementById("income-list");
const incomeTotalContainer = document.getElementById("income-total");
const expenseInputDescription = document.getElementById("expense-description");
const expenseInputAmount = document.getElementById("expense-amount");
const expenseSubmitBtn = document.querySelector("#expense-submit-button");
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

// display income info
function renderIncome(objArray) {
    objArray.forEach(obj => {
        incomeListContainer.innerHTML += `
            <p>+ ${obj.attributes.description} $${obj.attributes.amount}</p>
        `
        incomeTotal += obj.attributes.amount
        newBudget += incomeTotal
    })
    newBudgetContainer.innerHTML = `
        <h4>Remaining Budget: $${newBudget}</h4>
    `
    incomeTotalContainer.innerHTML = `
        <h4>Income Total: $${incomeTotal}</h4>
    `
}

// display expense info
function renderExpense(objArray) {
    objArray.forEach(obj => {
        expenseListContainer.innerHTML += `
            <p>- ${obj.attributes.description} $${obj.attributes.amount}</p>
        `
        expenseTotal += obj.attributes.amount
        newBudget = incomeTotal - expenseTotal
    })
    newBudgetContainer.innerHTML = `
        <h4>Remaining Budget: $${newBudget}</h4>
    `
    expenseTotalContainer.innerHTML = `
        <h4>Expense Total: $${expenseTotal}</h4>
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
        setTimeout(() => {loginError.style.display = 'none'}, 5000)
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

        fetch(`http://localhost:3000/users/` + currentUserId)
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
                const subcategoryObj = {};

                expenseList.forEach(expense => {
                    if(!subcategoryObj[expense.attributes.subcategory.name]){
                        subcategoryObj[expense.attributes.subcategory.name] = 0;
                    }
                    subcategoryObj[expense.attributes.subcategory.name]+= expense.attributes.amount;

                })

            console.log(expenseList)
            renderIncome(incomeList);
            renderExpense(expenseList);

            });
        });
}

logoutBtn.addEventListener('click', function(e) {
    e.preventDefault()
    location.reload()
})


