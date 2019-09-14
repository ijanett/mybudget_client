const newBudgetContainer = document.querySelector("#end-budget-container");
// const budgetContainer = document.querySelector("#budget-container");
const subcategoryDropdown = document.getElementById("subcategory-dropdown");
const subcategoriesContainer = document.getElementById("subcategories-container")
const incomeInputDescription = document.getElementById("income-description");
const incomeInputAmount = document.getElementById("income-amount");
const incomeSubmitBtn = document.querySelector("#income-submit-button");
const incomeList = document.getElementById("income-list");
const incomeTotalContainer = document.getElementById("income-total");
const expenseInputDescription = document.getElementById("expense-description");
const expenseInputAmount = document.getElementById("expense-amount");
const expenseSubmitBtn = document.querySelector("#expense-submit-button");
const expenseList = document.getElementById("expense-list");
const expenseTotalContainer = document.getElementById("expense-total")
let expenseChart = document.getElementById("expense-chart").getContext("2d");
let user;
let budgets;
let income;
let incomeTotal = 0;
let expense;
let expenseTotal = 0;
let newBudget = 0;
let subcategoryNames;
let subcategories = [];


function renderIncome(objArray) {
    objArray.forEach(obj => {
        incomeList.innerHTML += `
            <li>${obj.attributes.description} $${obj.attributes.amount}</li>
        `
        incomeTotal += obj.attributes.amount
        newBudget += incomeTotal
    })
    newBudgetContainer.innerHTML += `
        <h4>Remaining Budget: $${newBudget}</h4>
    `
    incomeTotalContainer.innerHTML += `
        <h4>Income Total: $${incomeTotal}</h4>
    `
}

function renderExpense(objArray) {
    objArray.forEach(obj => {
        expenseList.innerHTML += `
            <li>${obj.attributes.description} $${obj.attributes.amount}</li>
        `
        expenseTotal += obj.attributes.amount
        newBudget = incomeTotal - expenseTotal
    })
    newBudgetContainer.innerHTML = `
        <h4>Remaining Budget: $${newBudget}</h4>
    `
    expenseTotalContainer.innerHTML += `
        <h4>Expense Total: $${expenseTotal}</h4>
    `
}

// function renderBudget(incomeTotal, expenseTotal) {
//     remainingBudget += incomeTotal
//     remainingBudget -= expenseTotal
//     console.log(remainingBudget)
//     newBudgetContainer.innerHTML += `
//         <h4>Remaining Budget: $${remainingBudget}</h4>
//     `
// };

// expense form submit
expenseSubmitBtn.addEventListener('click', function(e) {
    e.preventDefault();
})

// get subcategories and add to dropdown option values
// store in array
fetch("http://localhost:3000/subcategories")
    .then(res => res.json())
    .then(json => {
        json.data.forEach(function(obj) {
            subcategoryDropdown.innerHTML += `
            <option value="${obj.id}">${obj.attributes.name}</option>
            `
            subcategoryNames = obj.attributes.name;
            subcategories.push(subcategoryNames);
        })
    })

fetch("http://localhost:3000/users/1")
    .then(res => res.json())
    .then(json => {
        user = json;
        budgets = json.included;
        console.log(user);
        income = budgets.filter(budget => {
            return budget.attributes.category === "income"
        })
        expense = budgets.filter(budget => {
            return budget.attributes.category === "expense"
        })
        console.log(expense)
        renderIncome(income);
        renderExpense(expense);
        
        // budgetContainer.innerHTML += `
        // <h3>${user.data.attributes.username}</h3>
        // `

    });

// function renderUsers(json) {
//     Object.keys(json).forEach(function(key) {
//         const userObjs = json[key];
//         userObjs.forEach(user => {
//             userContainer.innerHTML += `
//             <h3>${user.attributes.username}</h3>
//             `
//         })
//     })
// }